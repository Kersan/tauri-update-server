import express from 'express';
import { compare } from 'compare-versions';
import { github } from '../lib/github.js';
import { getReleases } from '../lib/getReleases.js';
import { template } from '../lib/template.js';
import type { Request, Response } from 'express';

const app = express();

interface Parameters {
    current_version: string;
    target: string;
    arch: string;
}

app.get('/update', async (req: Request<{}, {}, {}, Parameters>, res: Response) => {
    console.log('Request:', req.query);
    if (req.query.current_version && req.query.target && req.query.arch) {
        const latest = await github();
        console.log('Latest release tag:', latest.tag_name);
        console.log('Current version:', req.query.current_version);
        console.log('Comparison result:', compare(latest.tag_name, req.query.current_version, '>'));
        
        if (compare(latest.tag_name, req.query.current_version, '>')) {
            const version = process.env.TAG_STRUCTURE ? latest.tag_name.split(process.env.TAG_STRUCTURE)[1] : latest.tag_name;
            console.log('Version after processing:', version);
            console.log('Available assets:', latest.assets.map((a: any) => a.name));
            
            const release = getReleases(latest.assets, req.query.target, req.query.arch);
            console.log('Found release:', release);
            
            if (Object.keys(release).length !== 0) {
                res.status(200).send(await template(release, version, req.query.current_version));
            } else {
                console.log('No release found for target:', req.query.target, 'arch:', req.query.arch);
                res.status(204).send();
            }
        } else {
            console.log('No update available - current version is up to date');
            res.status(204).send();
        
        }
    } else {
        console.log('Invalid request');
        res.status(400).send({
            message: 'Invalid request',
        });
    }
});
console.log('Envs:', {
    USERNAME: process.env.USERNAME,
    REPO: process.env.REPO,
    TAG_STRUCTURE: process.env.TAG_STRUCTURE,
    DEFAULT_LANG: process.env.DEFAULT_LANG,
    SIGNATURE: process.env.SIGNATURE,
});
app.listen(8080, '0.0.0.0', () => console.log(`Server started at http://0.0.0.0:8080/`));
