#!/bin/bash

# usage ./bash [fav.js|reblog.js|cookie.js] [300|1800] 30?

SCRIPT=$1
DEALY=$2
ITERATION=$3

echo "SCRIPT=$SCRIPT"

countdown() {
  local seconds=$1
  while [ $seconds -gt 0 ]; do
    echo -ne "Countdown: $seconds seconds\033[0K\r"
    sleep 1
    ((seconds--))
  done
  echo -e "Countdown complete!\n"
}

for ((i=1; i<=$ITERATION; i++))
do
  echo "Iteration $i"
  # 在这里添加要重复执行的代码
  node $1
  echo "Iteration $i done"
  countdown $2
done