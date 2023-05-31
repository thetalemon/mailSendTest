import type { NextApiRequest, NextApiResponse } from 'next'
import { createTransport } from 'nodemailer'
import { IncomingForm, Fields, Files } from 'formidable'
import fs from 'fs'
import { SELECT_CHOICE_LIST } from '@/pages/constant/constant'

const transporter = createTransport({
  service: process.env.MAIL_SERVICE,
  secure: true,
  auth: {
    user: process.env.MAIL_AUTH_USER,
    pass: process.env.MAIL_AUTH_PASS,
  },
})

export const config = {
  api: {
    bodyParser: false,
  },
}

const parseForm = (
  req: NextApiRequest
): Promise<{ fields: Fields; files: Files }> => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm()
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err)
      } else {
        resolve({ fields, files })
      }
    })
  })
}

const createMessage = (textarea: string, select: string): string => {
  return `
  選択肢: ${
    SELECT_CHOICE_LIST.filter((item) => item.id === Number(select))[0].name
  }
  ${textarea}`
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const method = req.method
  switch (method) {
    case 'POST': {
      console.log('POSTがきました')
      const data = await parseForm(req)
      const file = data.files.file
      if (!Array.isArray(file) || file[0].originalFilename === null) {
        res.status(500).end()
        break
      }

      try {
        transporter.sendMail({
          from: process.env.MAIL_FORM_USER,
          to: process.env.MAIL_TO_DEFAULT,
          subject: 'てすとだよ',
          text: createMessage(
            data.fields.textarea as string,
            data.fields.select as string
          ),
          attachments: [
            {
              filename: file[0].originalFilename,
              contentType: 'application/pdf',
              content: fs.readFileSync(file[0].filepath),
            },
          ],
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
