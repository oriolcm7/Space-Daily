#!/usr/bin/env python3
"""Collect RSS headlines and archive a daily edition without paid APIs."""
import json, re, html, hashlib, os
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from zoneinfo import ZoneInfo
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
EDITION_DIR = ROOT / 'editions'
FEEDS = [
    ('NASA', 'https://www.nasa.gov/news-release/feed/'),
    ('SpaceNews', 'https://spacenews.com/feed/'),
    ('European Spaceflight', 'https://europeanspaceflight.com/feed/'),
    ('ESA', 'https://www.esa.int/rssfeed/Our_Activities/Space_News'),
]

def clean(value):
    value = re.sub(r'<[^>]+>', ' ', value or '')
    return re.sub(r'\s+', ' ', html.unescape(value)).strip()

def parse_date(value):
    if not value: return ''
    try:
        dt = parsedate_to_datetime(value)
        if dt.tzinfo is None: dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc).isoformat()
    except Exception: return ''

def category(text):
    t = text.lower()
    if any(x in t for x in ('launch', 'rocket', 'launcher', 'ariane', 'falcon', 'vulcan', 'starship')): return 'Lanzadores'
    if any(x in t for x in ('satellite', 'spacecraft', 'constellation', 'earth observation', 'telecommunications')): return 'Satélites'
    if any(x in t for x in ('mission', 'mars', 'moon', 'lunar', 'planet', 'probe', 'rover', 'telescope')): return 'Misiones'
    if any(x in t for x in ('industry', 'contract', 'company', 'manufactur', 'investment', 'european space')): return 'Industria'
    return 'Ingeniería'

def get_text(item, names):
    for name in names:
        el = item.find(name)
        if el is not None and el.text: return el.text.strip()
    return ''

def collect():
    items, errors = [], []
    for source, url in FEEDS:
        try:
            req = Request(url, headers={'User-Agent':'DailySpaceNews/1.0 (RSS reader; personal project)'})
            with urlopen(req, timeout=20) as response: raw = response.read()
            root = ET.fromstring(raw)
            found = root.findall('.//item')
            # Atom fallback
            if not found:
                found = root.findall('.//{http://www.w3.org/2005/Atom}entry')
            for item in found:
                title = clean(get_text(item, ['title', '{http://www.w3.org/2005/Atom}title']))
                link = get_text(item, ['link'])
                if not link:
                    le = item.find('{http://www.w3.org/2005/Atom}link')
                    if le is not None: link = le.attrib.get('href','')
                desc = clean(get_text(item, ['description', 'summary', '{http://www.w3.org/2005/Atom}summary', '{http://www.w3.org/2005/Atom}content']))
                pub = get_text(item, ['pubDate', 'published', 'updated', '{http://www.w3.org/2005/Atom}published', '{http://www.w3.org/2005/Atom}updated'])
                if not title or not link or not link.startswith('http'): continue
                ident = hashlib.sha1(link.split('?')[0].rstrip('/').lower().encode()).hexdigest()[:12]
                items.append({'id':ident, 'title':title, 'summary':desc[:700], 'source':source, 'url':link, 'published':parse_date(pub), 'category':category(title+' '+desc), 'label':source.upper()})
        except Exception as e:
            errors.append(f'{source}: {type(e).__name__}')
    # Deduplicate and sort newest first; cap at 36 headlines
    unique = {}
    for item in items: unique.setdefault(item['id'], item)
    result = list(unique.values())
    result.sort(key=lambda x: x.get('published',''), reverse=True)
    return result[:36], errors

def main():
    now = datetime.now(ZoneInfo("Europe/Madrid"))
    day = now.date().isoformat()
    articles, errors = collect()
    EDITION_DIR.mkdir(exist_ok=True)
    path = EDITION_DIR / f'{day}.json'
    # Avoid replacing a good edition with an empty result after a temporary RSS outage.
    if not articles and path.exists():
        print('No RSS items; keeping existing edition.')
        return
    edition = {'date':day, 'generated_at':now.isoformat(), 'title':'Daily Space News', 'mode':'rss', 'article_count':len(articles), 'articles':articles, 'feed_errors':errors, 'note':'Titulares y descripciones recopilados automáticamente de fuentes RSS. La traducción editorial con IA no está activada en esta versión gratuita.'}
    path.write_text(json.dumps(edition, ensure_ascii=False, indent=2), encoding='utf-8')
    editions = []
    for f in sorted(EDITION_DIR.glob('????-??-??.json'), reverse=True):
        try:
            data=json.loads(f.read_text(encoding='utf-8'))
            editions.append({'date':data.get('date',f.stem), 'article_count':data.get('article_count',len(data.get('articles',[]))), 'file':f.name})
        except Exception: pass
    (EDITION_DIR/'index.json').write_text(json.dumps({'editions':editions}, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'Saved {len(articles)} articles for {day}; feed errors: {errors}')
if __name__ == '__main__': main()
