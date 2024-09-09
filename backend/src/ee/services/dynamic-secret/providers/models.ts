import { z } from "zod";

export enum SqlProviders {
  Postgres = "postgres",
  MySQL = "mysql2",
  Oracle = "oracledb",
  MsSQL = "mssql"
}

export const DynamicSecretRedisDBSchema = z.object({
  host: z.string().trim().toLowerCase(),
  port: z.number(),
  username: z.string().trim(), // this is often "default".
  password: z.string().trim().optional(),

  creationStatement: z.string().trim(),
  revocationStatement: z.string().trim(),
  renewStatement: z.string().trim().optional(),
  ca: z.string().optional()
});

export const DynamicSecretAwsElastiCacheSchema = z.object({
  clusterName: z.string().trim().min(1),
  accessKeyId: z.string().trim().min(1),
  secretAccessKey: z.string().trim().min(1),

  region: z.string().trim(),
  creationStatement: z.string().trim(),
  revocationStatement: z.string().trim(),
  ca: z.string().optional()
});

export const DynamicSecretElasticSearchSchema = z.object({
  host: z.string().trim().min(1),
  port: z.number(),

  // two auth types "user, apikey"
  auth: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("user"),
      username: z.string().trim(),
      password: z.string().trim()
    }),
    z.object({
      type: z.literal("api-key"),
      apiKey: z.string().trim(),
      apiKeyId: z.string().trim()
    })
  ]),

  creationStatement: z.string().trim(),
  revocationStatement: z.string().trim(),
  ca: z.string().optional()
});

export const DynamicSecretSqlDBSchema = z.object({
  client: z.nativeEnum(SqlProviders),
  host: z.string().trim().toLowerCase(),
  port: z.number(),
  database: z.string().trim(),
  username: z.string().trim(),
  password: z.string().trim(),
  creationStatement: z.string().trim(),
  revocationStatement: z.string().trim(),
  renewStatement: z.string().trim().optional(),
  ca: z.string().optional()
});

export const DynamicSecretCassandraSchema = z.object({
  host: z.string().trim().toLowerCase(),
  port: z.number(),
  localDataCenter: z.string().trim().min(1),
  keyspace: z.string().trim().optional(),
  username: z.string().trim(),
  password: z.string().trim(),
  creationStatement: z.string().trim(),
  revocationStatement: z.string().trim(),
  renewStatement: z.string().trim().optional(),
  ca: z.string().optional()
});

export const DynamicSecretAwsIamSchema = z.object({
  accessKey: z.string().trim().min(1),
  secretAccessKey: z.string().trim().min(1),
  region: z.string().trim().min(1),
  awsPath: z.string().trim().optional(),
  permissionBoundaryPolicyArn: z.string().trim().optional(),
  policyDocument: z.string().trim().optional(),
  userGroups: z.string().trim().optional(),
  policyArns: z.string().trim().optional()
});

export const DynamicSecretMongoAtlasSchema = z.object({
  adminPublicKey: z.string().trim().min(1).describe("Admin user public api key"),
  adminPrivateKey: z.string().trim().min(1).describe("Admin user private api key"),
  groupId: z
    .string()
    .trim()
    .min(1)
    .describe("Unique 24-hexadecimal digit string that identifies your project. This is same as project id"),
  roles: z
    .object({
      collectionName: z.string().optional().describe("Collection on which this role applies."),
      databaseName: z.string().min(1).describe("Database to which the user is granted access privileges."),
      roleName: z
        .string()
        .min(1)
        .describe(
          ' Enum: "atlasAdmin" "backup" "clusterMonitor" "dbAdmin" "dbAdminAnyDatabase" "enableSharding" "read" "readAnyDatabase" "readWrite" "readWriteAnyDatabase" "<a custom role name>".Human-readable label that identifies a group of privileges assigned to a database user. This value can either be a built-in role or a custom role.'
        )
    })
    .array()
    .min(1),
  scopes: z
    .object({
      name: z
        .string()
        .min(1)
        .describe(
          "Human-readable label that identifies the cluster or MongoDB Atlas Data Lake that this database user can access."
        ),
      type: z
        .string()
        .min(1)
        .describe("Category of resource that this database user can access. Enum: CLUSTER, DATA_LAKE, STREAM")
    })
    .array()
});

export enum DynamicSecretProviders {
  SqlDatabase = "sql-database",
  Cassandra = "cassandra",
  AwsIam = "aws-iam",
  Redis = "redis",
  AwsElastiCache = "aws-elasticache",
  MongoAtlas = "mongo-db-atlas",
  ElasticSearch = "elastic-search"
}

export const DynamicSecretProviderSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal(DynamicSecretProviders.SqlDatabase), inputs: DynamicSecretSqlDBSchema }),
  z.object({ type: z.literal(DynamicSecretProviders.Cassandra), inputs: DynamicSecretCassandraSchema }),
  z.object({ type: z.literal(DynamicSecretProviders.AwsIam), inputs: DynamicSecretAwsIamSchema }),
  z.object({ type: z.literal(DynamicSecretProviders.Redis), inputs: DynamicSecretRedisDBSchema }),
  z.object({ type: z.literal(DynamicSecretProviders.AwsElastiCache), inputs: DynamicSecretAwsElastiCacheSchema }),
  z.object({ type: z.literal(DynamicSecretProviders.MongoAtlas), inputs: DynamicSecretMongoAtlasSchema }),
  z.object({ type: z.literal(DynamicSecretProviders.ElasticSearch), inputs: DynamicSecretElasticSearchSchema })
]);

export type TDynamicProviderFns = {
  create: (inputs: unknown, expireAt: number) => Promise<{ entityId: string; data: unknown }>;
  validateConnection: (inputs: unknown) => Promise<boolean>;
  validateProviderInputs: (inputs: object) => Promise<unknown>;
  revoke: (inputs: unknown, entityId: string) => Promise<{ entityId: string }>;
  renew: (inputs: unknown, entityId: string, expireAt: number) => Promise<{ entityId: string }>;
};
