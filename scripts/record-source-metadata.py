from pathlib import Path
import urllib.request,urllib.parse,json
root=Path(__file__).resolve().parents[1]/'production/night-side';out=root/'source-metadata';out.mkdir(exist_ok=True)
for identifier in ['Marshall Night Stars','GSFC_20180124_m12825_ISS_Airglow','GSFC_20170412_Lights_m12573_EarthAtNight']:
 url='https://images-api.nasa.gov/search?'+urllib.parse.urlencode({'nasa_id':identifier})
 with urllib.request.urlopen(url,timeout=30) as response:data=json.load(response)
 items=[i for i in data['collection']['items'] if i['data'][0]['nasa_id']==identifier]
 if not items:raise ValueError('Source metadata missing: '+identifier)
 (out/(identifier.replace(' ','-')+'.json')).write_text(json.dumps({'source':url,'items':items},indent=2));print(identifier)
