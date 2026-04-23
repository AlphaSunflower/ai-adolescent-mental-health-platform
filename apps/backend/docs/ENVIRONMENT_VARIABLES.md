# Backend Environment Variables

The backend reads environment-specific values from process environment variables and, for local development, an optional `apps/backend/.env` file.
Do not commit `application-dev.yml`, `application-test.yml`, `application-local.yml`, or other profile-specific configuration files under `src/main/resources` or `src/test/resources`.
Do not commit `apps/backend/.env`; commit only `apps/backend/.env.example`.

## Required variables

| Variable | Description |
| --- | --- |
| `DB_MYSQL_HOST` | MySQL host. |
| `DB_MYSQL_PORT` | MySQL port. |
| `DB_MYSQL_DATABASE` | MySQL database name. |
| `DB_MYSQL_USERNAME` | MySQL username. |
| `DB_MYSQL_PASSWORD` | MySQL password. |
| `DB_REDIS_HOST` | Redis host. |
| `DB_REDIS_PORT` | Redis port. |
| `ALIYUN_OSS_ENDPOINT` | Aliyun OSS endpoint. |
| `ALIYUN_OSS_ACCESS_KEY_ID` | Aliyun OSS access key ID. |
| `ALIYUN_OSS_ACCESS_KEY_SECRET` | Aliyun OSS access key secret. |
| `ALIYUN_OSS_BUCKET_NAME` | Aliyun OSS bucket name. |
| `JWT_SECRET` | JWT signing secret. Use a long random secret suitable for HS256. |
| `DASHSCOPE_API_KEY` | DashScope API key. |
| `WX_APP_ID` | WeChat mini program app ID. |
| `WX_APP_SECRET` | WeChat mini program app secret. |
| `WX_GZH_APP_ID` | WeChat official account app ID. |
| `WX_GZH_SECRET` | WeChat official account secret. |
| `WX_GZH_CALLBACK_BASE_URL` | WeChat official account callback base URL. |
| `MAIL_HOST` | SMTP server host. |
| `MAIL_PORT` | SMTP server port. |
| `MAIL_USERNAME` | SMTP account username. |
| `MAIL_PASSWORD` | SMTP account password or authorization code. |

## Local startup with `.env`

Copy the example file and fill in local values:

```powershell
cd apps/backend
Copy-Item .env.example .env
```

Then start the backend from `apps/backend`:

```powershell
.\mvnw.cmd spring-boot:run
```

The root package script also works:

```powershell
pnpm dev:backend
```

## CI/CD

Configure the same variable names in the CI/CD platform's secrets or variables store.
The repository should not contain environment-specific Spring Boot configuration files with real values.
