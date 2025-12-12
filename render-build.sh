set -o errexit

npm ci
npx prisma generate
npm run build
npx prisma migrate deploy
npm prune --production