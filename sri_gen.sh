#!/bin/bash

# Check if a file was provided
if [ -z "$1" ]; then
    echo "Usage: ./sri_gen.sh <file_path>"
    exit 1
fi

FILE_PATH=$1

if [ ! -f "$FILE_PATH" ]; then
    echo "Error: File '$FILE_PATH' not found."
    exit 1
fi

# 1. 'cat' reads the file
# 2. 'sed' removes any '\r' (CR) characters to ensure LF line endings
# 3. 'openssl' generates the binary digest
# 4. 'base64' encodes the result
HASH_SHA512=$(cat "$FILE_PATH" | sed 's/\r$//' | openssl dgst -sha512 -binary | openssl base64 -A)

echo "integrity=\"sha512-$HASH_SHA512\""

HASH_SHA384=$(cat "$FILE_PATH" | sed 's/\r$//' | openssl dgst -sha384 -binary | openssl base64 -A)

echo "integrity=\"sha384-$HASH_SHA384\""

HASH_SHA256=$(cat "$FILE_PATH" | sed 's/\r$//' | openssl dgst -sha256 -binary | openssl base64 -A)

echo "integrity=\"sha256-$HASH_SHA256\""