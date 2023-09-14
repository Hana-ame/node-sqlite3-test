#!/bin/bash

for ((i=1; i<=18; i++))
do
  echo "Iteration $i"
  # 在这里添加要重复执行的代码
  node cookie.js
  echo "Iteration $i done"
  sleep 300
done