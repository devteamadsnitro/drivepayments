// Platform values are read at use time. See the Webdev service/authentication skills.
export const ENV = {
  get appId() { return process.env.MANUS_PROJECT_ID ?? ""; },
  get cookieSecret() { return process.env.MANUS_JWT_SECRET ?? ""; },
  get databaseUrl() { return process.env.DATABASE_URL ?? ""; },
  get oAuthServerUrl() { return process.env.MANUS_OAUTH_API_URL ?? ""; },
  // Preserve the legacy hint when supplied; otherwise roles remain application data.
  get ownerOpenId() { return process.env.OWNER_OPEN_ID ?? ""; },
  get isProduction() { return process.env.NODE_ENV === "production"; },
  get forgeApiUrl() { return process.env.MANUS_API_URL ?? ""; },
  get forgeApiKey() { return process.env.MANUS_API_KEY ?? ""; },
  // Object storage (Railway Bucket / any S3-compatible provider)
  get s3Bucket() { return process.env.S3_BUCKET ?? ""; },
  get s3Endpoint() { return process.env.S3_ENDPOINT ?? ""; },
  get s3Region() { return process.env.S3_REGION ?? ""; },
  get s3AccessKeyId() { return process.env.S3_ACCESS_KEY_ID ?? ""; },
  get s3SecretAccessKey() { return process.env.S3_SECRET_ACCESS_KEY ?? ""; },
  get s3ForcePathStyle() { return process.env.S3_FORCE_PATH_STYLE === "true"; },
};
