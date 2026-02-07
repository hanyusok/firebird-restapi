#!/bin/bash
BASE_URL="http://localhost:3000/api/mtswait"
DATE="20260212"
DATE_FMT="2026-02-12"
PCODE=9999

echo "--- 1. Testing CREATE ---"
curl -s -X POST -H "Content-Type: application/json" -d "{\"PCODE\": $PCODE, \"VISIDATE\": \"$DATE_FMT\"}" "$BASE_URL"
echo -e "\n"

echo "--- 2. Testing READ (Verify Create) ---"
RESPONSE=$(curl -s "$BASE_URL/date/$DATE")
echo "Response: $RESPONSE"
if [[ $RESPONSE == *"$PCODE"* ]]; then
  echo "SUCCESS: Record found."
else
  echo "FAILURE: Record not found."
fi
echo ""

echo "--- 3. Testing UPDATE ---"
# Check what RESID1 is usually. It's long. We'll set a dummy.
NEW_RESID1="20260212888888"
curl -s -X PUT -H "Content-Type: application/json" -d "{\"RESID1\": \"$NEW_RESID1\", \"RESID2\": \"$DATE_FMT\"}" "$BASE_URL/$PCODE/$DATE_FMT"
echo -e "\n"

echo "--- 4. Testing READ (Verify Update) ---"
RESPONSE=$(curl -s "$BASE_URL/date/$DATE")
echo "Response: $RESPONSE"
if [[ $RESPONSE == *"$NEW_RESID1"* ]]; then
  echo "SUCCESS: Update verified."
else
  echo "FAILURE: Update not reflected."
fi
echo ""

echo "--- 5. Testing DELETE ---"
curl -s -X DELETE "$BASE_URL/$PCODE/$DATE_FMT"
echo -e "\n"

echo "--- 6. Testing READ (Verify Delete) ---"
RESPONSE=$(curl -s "$BASE_URL/date/$DATE")
echo "Response: $RESPONSE"
if [[ $RESPONSE == *"No records found"* ]]; then
  echo "SUCCESS: Record deleted."
else
  echo "FAILURE: Record still exists."
fi
echo ""
