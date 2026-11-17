#!/usr/bin/env python3
"""Audio vidéo Béto : voix + musique rythmée (112 BPM, ducking) + whoosh d'entrée"""
import subprocess
R = "/home/user/faten/comptoir-gep-video"; O = "/tmp/foot/out"; TOTAL = 38.87
fc = ("[0:a]aresample=44100,aformat=channel_layouts=stereo,apad,atrim=0:%s,asplit[v1][v2];"
      "[1:a]aresample=44100,aformat=channel_layouts=stereo,atrim=0:%s,volume=0.55[m1];"
      "[m1][v1]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=400[md];"
      "[2:a]aresample=44100,aformat=channel_layouts=stereo,volume=0.7,atrim=0:0.9[w1];"
      "[w1]asplit[wa][wb];[wb]adelay=1550|1550[wb2];"
      "[v2][md][wa][wb2]amix=inputs=4:normalize=0:weights=1.6 1.1 0.7 0.7,afade=t=out:st=%s:d=1.2[a]") % (TOTAL, TOTAL, TOTAL - 1.2)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", R + "/assets/beto_voice.mp3", "-i", R + "/assets/music.wav", "-i", R + "/assets/whoosh.wav", "-filter_complex", fc, "-map", "[a]", "-t", str(TOTAL), "-c:a", "aac", "-b:a", "192k", O + "/beto_audio.m4a"], check=True)
print("ok")
