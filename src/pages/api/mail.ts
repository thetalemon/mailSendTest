import type { NextApiRequest, NextApiResponse } from 'next'
import { createTransport } from 'nodemailer'
import { IncomingForm, Fields, Files } from 'formidable'
import fs from 'fs'

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

interface myFile extends File {
  originalFilename: string
  filepath: string
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
      if (Array.isArray(file) || file.originalFilename === null) {
        res.status(500).end()
        break
      }

      try {
        transporter.sendMail({
          from: process.env.MAIL_FORM_USER,
          to: process.env.MAIL_TO_DEFAULT,
          subject: 'てすとだよ',
          text: data.fields.textarea as string,
          attachments: [
            {
              filename: file.originalFilename,
              contentType: 'application/pdf',
              content: fs.readFileSync(file.filepath),
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
