"""Production-only speech worker. Models are local; not an owner dependency."""
import os
os.environ['ORT_DISABLE_TELEMETRY']='1'
os.environ['HF_HUB_DISABLE_TELEMETRY']='1'
os.environ['HF_HUB_OFFLINE']='1'
os.environ['TRANSFORMERS_OFFLINE']='1'
import json,sys,pathlib,re
import onnxruntime as ort
ort.disable_telemetry_events()
from kokoro_onnx import Kokoro
import numpy as np
import soundfile as sf
models=pathlib.Path(os.environ['VISIONFORGE_PRODUCTION_MODELS'])
request=json.load(sys.stdin)
if request.get('voice')!='am_michael':raise ValueError('Production voice must be am_michael')
model=Kokoro(str(models/'kokoro-v1.0.onnx'),str(models/'voices-v1.0.bin'))
chunks=[];paragraphs=[];cues=[];cursor=0.0;sr=24000
for paragraph in request['input'].strip().split('\n\n'):
 start=cursor
 for sentence in re.split(r'(?<=[.!?])\s+',paragraph.strip()):
  audio,sr=model.create(sentence,voice='am_michael',speed=.90,lang='en-us')
  cues.append({'text':sentence,'startSeconds':cursor,'endSeconds':cursor+len(audio)/sr})
  chunks.extend([audio,np.zeros(round(sr*.16),dtype=np.float32)]);cursor+=len(audio)/sr+.16
 chunks.append(np.zeros(round(sr*.24),dtype=np.float32));cursor+=.24
 paragraphs.append({'text':paragraph,'startSeconds':start,'endSeconds':cursor})
sf.write(sys.argv[1],np.concatenate(chunks),sr,subtype='PCM_16')
pathlib.Path(sys.argv[2]).write_text(json.dumps({'durationSeconds':cursor,'paragraphs':paragraphs,'captions':cues,'captionMethod':'Measured sentence-level synthesized utterance bounds, not ASR or estimated word timestamps'},indent=2))
