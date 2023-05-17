import Head from 'next/head'
import styles from '@/styles/Home.module.scss'
import { useState } from 'react'

export default function Home() {
  const [text, setText] = useState('')

  const onClick = () => {
    // メールをPOSTする
    fetch('/api/mail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'テストメール',
        body: text,
      }),
    })
  }

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
  }

  return (
    <>
      <Head>
        <title>Mail Test App</title>
        <meta name='description' content='Generated by create next app' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main>
        <div className={`${styles.send}`}>
          <textarea onChange={(e) => onChange(e)} />
          <button onClick={() => onClick()}>めーるおくるよー</button>
        </div>
      </main>
    </>
  )
}
