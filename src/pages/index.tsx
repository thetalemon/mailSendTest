import Head from 'next/head'
import styles from './index.module.scss'
import { useState, useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { SELECT_CHOICE_LIST } from '@/pages/constant/constant'

type SelectChoiceId = (typeof SELECT_CHOICE_LIST)[number]['id']

const schema = z.object({
  textarea: z.string().min(1, { message: '必須です' }),
  select: z.custom<SelectChoiceId>(),
  file: z.custom<File>().refine((file) => file && file.name, {
    message: 'pdfファイルは必須です',
  }),
})

type Schema = z.infer<typeof schema>

interface SchemaInterface {
  [key: string]: string | number | Blob
}

interface CustomFormData extends FormData {
  append<T extends string | Blob>(
    name: keyof Schema,
    value: T,
    fileName?: string
  ): void
}

const createFormDatata = (data: Schema) => {
  const formData = new FormData() as CustomFormData
  Object.keys(data).forEach((key: string) => {
    const subKey = key as keyof Schema
    const d = data as SchemaInterface
    const tmp = d[subKey]
    if (typeof tmp === 'number') {
      formData.append(subKey, String(tmp))
    } else {
      formData.append(subKey, tmp)
    }
  })
  return formData
}

export default function Home() {
  const [result, setResult] = useState<string>()
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Schema>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      select: 2,
    },
  })

  const watchFile = watch('file')
  const FileNamePreview = useMemo(() => {
    if (!watchFile || !watchFile.name) {
      return <></>
    }

    return (
      <span className={styles.fileNamePreview}>
        選択中のファイル: {watchFile.name}
      </span>
    )
  }, [watchFile])

  const onDrop = useCallback(
    (acceptedFiles: File[]): void => {
      setValue('file', acceptedFiles[0], { shouldValidate: true })
    },
    [setValue]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
  })

  const onSubmit = (data: Schema) => {
    setResult('メールを送ってるよ……。')
    const formData = createFormDatata(data)
    fetch('/api/mail', {
      method: 'POST',
      body: formData,
    })
      .then((res) => {
        setResult('メールを送ったよ')
        console.log(res)
      })
      .catch((err) => {
        setResult('メールを送るのに失敗したよ……。')
        console.log(err)
      })
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
          {result === undefined ? (
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <div className={styles.formItem}>
                <label htmlFor='select'>選択肢を選択</label>
                <select {...register('select')} id='select'>
                  {SELECT_CHOICE_LIST.map((choice) => (
                    <option key={choice.id} value={choice.id}>
                      {choice.name}
                    </option>
                  ))}
                </select>
                <p>{errors.select?.message}</p>
              </div>
              <div className={styles.formItem}>
                <label htmlFor='file'>ファイルを選択</label>
                <div {...getRootProps()} className={styles.dropzone}>
                  <input {...getInputProps()} {...register('file')} id='file' />
                  {isDragActive ? (
                    <p>ここにドロップでpdfファイルをアップロード</p>
                  ) : (
                    <p>ここにドラッグ＆ドロップでpdfファイルをアップロード</p>
                  )}
                  {FileNamePreview}
                </div>
                <p>{errors.file?.message}</p>
              </div>
              <div className={styles.formItem}>
                <label htmlFor='textarea'>本文</label>
                <textarea id='textarea' {...register('textarea')} />
                <p>{errors.textarea?.message}</p>
              </div>
              <button
                type='submit'
                onClick={(e) => {
                  e.preventDefault
                }}
              >
                メール送信！
              </button>
            </form>
          ) : (
            <p>{result}</p>
          )}
        </div>
      </main>
    </>
  )
}
