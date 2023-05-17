// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { createTransport } from 'nodemailer'

type Data = {
  name: string
}

const transporter = createTransport({
  service: process.env.MAIL_SERVICE,
  secure: true,
  auth: {
    user: process.env.MAIL_AUTH_USER,
    pass: process.env.MAIL_AUTH_PASS,
  },
})

//メールの内容
const MailText = `
  テストのメールです。
  テストなので、返信不要です。
  `

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const method = req.method
  switch (method) {
    case 'POST': {
      console.log('POSTがきたよ')
      const { title, body } = req.body
      try {
        await transporter.sendMail({
          from: process.env.MAIL_FORM_USER,
          to: process.env.MAIL_TO_DEFAULT,
          subject: title,
          text: body,
        })
        console.log(`メールを送信した気がします`)
        res.status(200).end()
      } catch (error) {
        console.log(error)
        console.log(`メールを送信できませんでした`)
        res.status(500).end()
      }
      res.status(500).end()
      break
    }
    default: {
      res.status(404).end()
    }
  }
}
