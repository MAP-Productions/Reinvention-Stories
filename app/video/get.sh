#!/bin/bash

cat list.txt | while read url;

do
wget "https://dl.dropbox.com/u/3531958/reinvention/${url}.mp4";
wget "https://dl.dropbox.com/u/3531958/reinvention/${url}.webm";
wget "https://dl.dropbox.com/u/3531958/reinvention/${url}.ogv";

done
