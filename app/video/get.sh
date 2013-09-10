#!/bin/bash

cat list.txt | while read url;

do
wget "http://www.reinventionstories.org/app/video/${url}";

done
