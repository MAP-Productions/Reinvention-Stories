#!/bin/bash

cat list.txt | while read url;

do
wget "https://dl.dropbox.com/u/3531958/reinvention/${url}";

done
