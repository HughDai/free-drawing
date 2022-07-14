#!/bin/sh
host="45.77.23.183"

yarn build
echo "deploy started..."
scp -r dist/* root@$host:freedrawing/
# ssh root@$host "sudo nginx -s reload"
echo "deploy completed"
