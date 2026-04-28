import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function POST(req, { params }) {
  try {
    const { name, email, message } = await req.json()

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 })
    }

    const professional = await prisma.professional.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, email: true },
    })

    if (!professional) {
      return NextResponse.json({ error: 'Professional not found.' }, { status: 404 })
    }

    if (!professional.email) {
      return NextResponse.json({ error: 'This tech does not have a contact email set yet.' }, { status: 400 })
    }

    const host = process.env.SMTP_HOST
    const port = Number(process.env.SMTP_PORT || 587)
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    const from = process.env.EMAIL_FROM || user

    if (!host || !user || !pass || !from) {
      return NextResponse.json(
        {
          error:
            'Email is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and EMAIL_FROM.',
        },
        { status: 500 },
      )
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    })

    await transporter.sendMail({
      from,
      to: professional.email,
      replyTo: email.trim(),
      subject: `New Beauty Book message for ${professional.name}`,
      text: [
        `You received a new message from a potential client.`,
        '',
        `Tech: ${professional.name}`,
        `Client Name: ${name.trim()}`,
        `Client Email: ${email.trim()}`,
        '',
        'Message:',
        message.trim(),
      ].join('\n'),
      html: `
        <h2>New Beauty Book message</h2>
        <p><strong>Tech:</strong> ${professional.name}</p>
        <p><strong>Client Name:</strong> ${name.trim()}</p>
        <p><strong>Client Email:</strong> ${email.trim()}</p>
        <p><strong>Message:</strong></p>
        <p>${message.trim().replace(/\n/g, '<br/>')}</p>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
