#!/bin/bash
date
# PATH="/home/ubuntu/anaconda3/bin:$PATH"
# which python

set -e
# Run from local dir
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path"

BKP_NAME=tests-mongo-$(date '+%Y-%m-%d_%H-%M-%S')
BDIR=backup/$BKP_NAME
mkdir -p $BDIR
chmod -R 777 $BDIR
COLLECTIONS=$(docker run --rm --network host mongo mongo localhost:27017/tetsts --quiet --eval "db.getCollectionNames()" | tr -d '\[\]\" ' | tr ',' ' ')

for collection in $COLLECTIONS; do
    if [[ $collection == websessions ]]; then
      continue
    fi
    echo "Exporting $collection ..."
    docker run --rm --network host -v $(pwd)/$BDIR:/bkp mongo mongoexport -d tests -c $collection -o /bkp/$collection.json
done

echo "Packing..."
tar zcvf backup/$BKP_NAME.tar.gz $BDIR

echo "Uploading to S3..."
aws s3 cp backup/$BKP_NAME.tar.gz s3://tests-backup/ --storage-class STANDARD_IA

echo "Removing local copies.."
rm -rf BDIR
rm -rf backup/$BKP_NAME.tar.gz

echo "done"
