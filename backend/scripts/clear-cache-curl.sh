
#!/bin/bash
set -a
source .env.local
set +a

TODAY=$(date "+%Y-%m-%d")

echo "Clearing cache for $TODAY..."

curl -X DELETE "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/daily_plans?date=eq.$TODAY" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"

echo "Done."
