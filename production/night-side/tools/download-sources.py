import pathlib,urllib.request,concurrent.futures,json,hashlib
root=pathlib.Path(__file__).resolve().parents[1];assets=root/'assets';models=pathlib.Path('/workspace/scratch/e1abafcae699/production-models')
items=[
('ground-stars.mp4','https://images-assets.nasa.gov/video/Marshall%20Night%20Stars/Marshall%20Night%20Stars~large.mp4','NASA/MSFC; James Bilbrey, Joe Kuner','https://images-assets.nasa.gov/video/Marshall%20Night%20Stars/collection.json',assets),
('airglow-broll.mp4','https://images-assets.nasa.gov/video/GSFC_20180124_m12825_ISS_Airglow/GSFC_20180124_m12825_ISS_Airglow~orig.mp4','NASA/GSFC; Joy Ng et al.','https://images-assets.nasa.gov/video/GSFC_20180124_m12825_ISS_Airglow/collection.json',assets),
('night-lights.mp4','https://images-assets.nasa.gov/video/GSFC_20170412_Lights_m12573_EarthAtNight/GSFC_20170412_Lights_m12573_EarthAtNight~large.mp4','NASA/GSFC; Kathryn Mersmann, Joshua Stevens, Mike Carlowicz, Kate Ramsayer, Miguel Roman','https://images-assets.nasa.gov/video/GSFC_20170412_Lights_m12573_EarthAtNight/collection.json',assets),
('five-minutes-orbit.mp4','https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/154000/154728/iss073e311235_moon_anim.mp4','NASA/JSC','https://science.nasa.gov/earth/earth-observatory/five-minutes-in-orbit-154728/',assets),
('earth-expedition42.mp4','https://assets.science.nasa.gov/content/dam/science/psd/lunar-science/2023/09/jsc2015m000273_orig.mp4','NASA/JSC','https://science.nasa.gov/resource/iss-expedition-42-time-lapse-video-of-earth/',assets),
('kokoro-v1.0.onnx','https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1/kokoro-v1.0.onnx','Kokoro-82M Apache2.0','https://github.com/thewh1teagle/kokoro-onnx',models),
('voices-v1.0.bin','https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1/voices-v1.0.bin','Kokoro-82M Apache2.0','https://github.com/thewh1teagle/kokoro-onnx',models)]
def download(item):
 name,url,credit,source,folder=item;folder.mkdir(exist_ok=True,parents=True);path=folder/name
 if not path.exists():
  with urllib.request.urlopen(url,timeout=180) as response,path.open('wb') as out:
   while block:=response.read(1024*1024):out.write(block)
 record={'name':name,'download':url,'credit':credit,'source':source,'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'terms':'NASA media guidelines with third-party exceptions and no endorsement' if folder==assets else 'Production-only model, not bundled in application'}
 print(name,record['bytes'],flush=True);return record
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:records=list(pool.map(download,items))
(root/'SOURCES.json').write_text(json.dumps({'mediaGuidelines':'https://www.nasa.gov/nasa-brand-center/images-and-media/','records':records},indent=2))
