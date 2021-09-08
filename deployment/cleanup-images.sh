#!/bin/bash
docker rmi $(docker images | awk '{ if ($1 == "registry.gitlab.com/tests/tests" && $2 != "latest") print $3 }')
