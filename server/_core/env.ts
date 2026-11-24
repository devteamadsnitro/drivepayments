// Values are read at use time so tests and tooling can stub them.
export const ENV = {
  /**
   * Signs CRM session cookies and derives the key for encrypted CRM notes.
   * MANUS_JWT_SECRET is accepted as a fallback for deployments created before
   * the Manus removal; the value must not change or old notes become unreadable.
   */
  get sessionSecret() { return process.env.SESSION_SECRET ?? process.env.MANUS_JWT_SECRET ?? ""; },
  /** One-time code required to create the first CRM administrator. */
  get crmSetupToken() { return process.env.CRM_SETUP_TOKEN ?? ""; },
  get databaseUrl() { return process.env.DATABASE_URL ?? ""; },
  get isProduction() { return process.env.NODE_ENV === "production"; },
  // Object storage (Railway Bucket / any S3-compatible provider)
  get s3Bucket() { return process.env.S3_BUCKET ?? ""; },
  get s3Endpoint() { return process.env.S3_ENDPOINT ?? ""; },
  get s3Region() { return process.env.S3_REGION ?? ""; },
  get s3AccessKeyId() { return process.env.S3_ACCESS_KEY_ID ?? ""; },
  get s3SecretAccessKey() { return process.env.S3_SECRET_ACCESS_KEY ?? ""; },
  get s3ForcePathStyle() { return process.env.S3_FORCE_PATH_STYLE === "true"; },
};
