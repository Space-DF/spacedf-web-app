export const getS3Url = (path: string) => {
  return `${process.env.NEXT_PUBLIC_S3_CLOUDFRONT_URL}/${path}`
}
