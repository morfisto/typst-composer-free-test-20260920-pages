"""Publish only the already compiled, reviewed inventory. No source build hooks."""
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess


def publish(root, output, source, workflow, operation, actual):
    if not re.fullmatch(r'[0-9a-f]{40}', source) or source != workflow or source != actual:
        raise ValueError('Reviewed website commit changed')
    if not re.fullmatch(r'[a-zA-Z0-9-]{16,128}', operation):
        raise ValueError('Invalid publication identity')
    inventory = json.loads((root / 'composer/site.json').read_text(encoding='utf-8'))
    if not inventory['files'] or len(inventory['files']) > 10000:
        raise ValueError('Invalid website inventory')
    seen = set()
    payload = []
    total = 0
    for entry in inventory['files']:
        name = entry['path']
        if name in seen or any(c in name for c in '\\:?#') or any(not p or p.startswith('.') or p.endswith((' ', '.')) for p in name.split('/')) or name == 'composer-release.json':
            raise ValueError('Invalid website path')
        seen.add(name)
        path = root / 'site' / name
        if path.is_symlink() or not path.resolve().is_relative_to((root / 'site').resolve()):
            raise ValueError('Website path escapes its inventory')
        data = path.read_bytes()
        total += len(data)
        if total > 256 * 1024 * 1024 or len(data) != entry['bytes'] or hashlib.sha256(data).hexdigest() != entry['sha256']:
            raise ValueError('Reviewed website file changed')
        payload.append((name, data))
    output.mkdir()
    for name, data in payload:
        dest = output / name
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
    marker = {'schemaVersion': 1, 'siteId': inventory['siteId'], 'sourceSha': source,
              'operationId': operation, 'files': inventory['files']}
    (output / 'composer-release.json').write_text(json.dumps(marker), encoding='utf-8')


if __name__ == '__main__':
    root = Path(__file__).resolve().parent.parent
    actual = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip()
    publish(root, root.parent / 'composer-public-site', os.environ['COMPOSER_SOURCE_SHA'],
            os.environ['COMPOSER_WORKFLOW_SHA'], os.environ['COMPOSER_OPERATION_ID'], actual)
