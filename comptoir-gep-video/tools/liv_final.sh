#!/bin/sh
# Assemble : vidéo avec textes + audio (voix/musique/whoosh) + whoosh final + transition rapide vers l'outro (contacts)
set -e
R=/home/user/faten/comptoir-gep-video; O=/tmp/foot/out
ffmpeg -v error -y -f lavfi -i "anoisesrc=d=0.6:c=white:a=0.5" -af "highpass=f=700,lowpass=f=7000,afade=t=in:d=0.35,afade=t=out:st=0.35:d=0.25,adelay=31800|31800,apad" -t 33 $O/whoosh_end.wav
ffmpeg -v error -y -i $R/remotion/out/livraison_text.mp4 -i $O/liv_audio.m4a -i $O/whoosh_end.wav -t 32.4 -filter_complex "[1:a][2:a]amix=inputs=2:normalize=0:duration=first,afade=t=out:st=32.0:d=0.4[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k $O/liv_main.mp4
ffmpeg -v error -y -i $O/liv_main.mp4 -i $O/outro.mp4 -filter_complex "[0:v]fps=30,settb=1/30[a0];[1:v]fps=30,settb=1/30[a1];[a0][a1]xfade=transition=wiperight:duration=0.25:offset=32.15[v];[0:a][1:a]acrossfade=d=0.25[a]" -map "[v]" -map "[a]" -c:v libx264 -crf 17 -preset veryfast -pix_fmt yuv420p -c:a aac -b:a 192k $R/comptoir-gep-livraison-v4-9x16.mp4
