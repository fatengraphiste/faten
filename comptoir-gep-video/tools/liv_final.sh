#!/bin/sh
# Assemble : vidéo avec textes + audio (voix/musique/whoosh) + outro Comptoir GEP
set -e
R=/home/user/faten/comptoir-gep-video; O=/tmp/foot/out
ffmpeg -v error -y -i $R/remotion/out/livraison_text.mp4 -i $O/liv_audio.m4a -t 33.0 -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -af "afade=t=out:st=32.4:d=0.6" $O/liv_main.mp4
ffmpeg -v error -y -i $O/liv_main.mp4 -i $O/outro.mp4 -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" -c:v libx264 -crf 17 -preset veryfast -pix_fmt yuv420p -c:a aac -b:a 192k $R/comptoir-gep-livraison-v2-9x16.mp4
