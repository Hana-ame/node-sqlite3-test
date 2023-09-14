#!/bin/bash
countdown() {
  local seconds=$1
  while [ $seconds -gt 0 ]; do
    echo -ne "Countdown: $seconds seconds\033[0K\r"
    sleep 1
    ((seconds--))
  done
  echo -e "Countdown complete!\n"
}

for ((i=1; i<=350; i++))
do
  echo "Iteration $i"
  # 在这里添加要重复执行的代码
  node cookie.js
  echo "Iteration $i done"
  countdown 300
done