import * as THREE from '../libs/three.module.js';
import { CONFIG } from './config.js';

const PALETTES = {
    store: { body: 0xf0e7d1, trim: 0x659986, deck: 0x496859, dark: 0x3d5147 },
    tea: { body: 0xe0bf88, trim: 0x61856c, deck: 0x92b691, dark: 0x5a3b2d },
    pond: { body: 0xba946e, trim: 0x496e50, deck: 0x779c63, dark: 0x504459 },
    laundry: { body: 0xeee9dc, trim: 0xa7bfae, deck: 0x709581, dark: 0x56635a },
};

function arrow() {
    const shape = new THREE.Shape();
    [[-.13, -.45], [.13, -.45], [.13, .02], [.36, .02], [0, .48], [-.36, .02], [-.13, .02]].forEach(([x,y],i) => i ? shape.lineTo(x,y) : shape.moveTo(x,y));
    shape.closePath(); return new THREE.ShapeGeometry(shape);
}

/** Authored obstacle forms share the existing collision dimensions and controls. */
export class ThemeObstacleKit {
    constructor(id) {
        this.id = id;
        const p = PALETTES[id], matte = color => new THREE.MeshStandardMaterial({ color, roughness: .8 });
        this.materials = { body: matte(p.body), trim: matte(p.trim), deck: matte(p.deck), dark: matte(p.dark),
            hazard: matte(0xe07760), cream: matte(0xfff2d7), feature: matte(0x44785c),
            mark: new THREE.MeshBasicMaterial({ color: 0xfff3d8, side: THREE.DoubleSide }) };
        const rampShape = new THREE.Shape(); rampShape.moveTo(0, 0); rampShape.lineTo(1, 1); rampShape.lineTo(1, 0); rampShape.closePath();
        const wedge = new THREE.ExtrudeGeometry(rampShape, { steps: 1, depth: 1, bevelEnabled: false });
        wedge.rotateY(-Math.PI/2); wedge.translate(.5, 0, 0);
        this.geometries = { box: new THREE.BoxGeometry(1,1,1), sphere: new THREE.SphereGeometry(1,12,8),
            cylinder: new THREE.CylinderGeometry(1,1,1,16), ring: new THREE.TorusGeometry(1,.1,5,20),
            arrow: arrow(), wedge, floor: new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2) };
    }

    part(parent, geometry, material, at, scale = [1,1,1], rotation = [0,0,0], shadow = true) {
        const mesh = new THREE.Mesh(this.geometries[geometry], this.materials[material]);
        mesh.position.set(...at); mesh.scale.set(...scale); mesh.rotation.set(...rotation);
        mesh.castShadow = shadow; mesh.receiveShadow = shadow; parent.add(mesh); return mesh;
    }

    create(type, options) {
        const g = new THREE.Group(); g.name = `${this.id}-${type}`;
        const { width:w, height:h, length:l, clearanceY } = options;
        if (type === 'ramp') {
            this.part(g,'wedge','deck',[0,0,0],[w,h,l]);
            for (let i=1;i<8;i++) this.part(g,'box','trim',[0,h*i/8+.016,l*i/8],[w,.025,.13]);
            const slope = Math.atan2(h,l);
            for (const t of [.24,.5,.76]) this.part(g,'arrow','mark',[0,h*t+.035,l*t],[1,1,1],[Math.PI/2-slope,0,0],false);
            for (const side of [-1,1]) {
                this.part(g,'box','body',[side*(w/2-.06),h/2+.14,l/2],[.10,.18,Math.hypot(l,h)],[ -slope,0,0]);
            }
        } else if (type === 'platform') {
            this.part(g,'box','body',[0,h/2,l/2],[w,h,l]);
            this.part(g,'box','deck',[0,h+.045,l/2],[w,.09,l]);
            for (const t of [.2,.5,.8]) this.part(g,'arrow','mark',[0,h+.1,l*t],[.8,.8,.8],[Math.PI/2,0,0],false);
            if (this.id === 'store') {
                for (const z of [1.5,l-1.5]) for (const x of [-w/2,w/2]) this.part(g,'cylinder','dark',[x,.3,z],[.28,.16,.28],[0,0,Math.PI/2]);
                for (const z of [1,5,9,13]) {
                    this.part(g,'box','trim',[0,h*.52,z],[w+.035,.55,.18]);
                    for(const side of [-1,1]) this.part(g,'box','trim',[side*w/2,h*.52,z],[.1,h*.7,1.8]);
                }
                this.part(g,'box','trim',[0,h*.5,-.025],[w,.14,.055]);
                this.part(g,'box','dark',[0,h*.65,-.06],[w*.5,.28,.04]);
            } else if (this.id === 'tea') {
                for (const side of [-1,1]) this.part(g,'box','trim',[side*w*.47,h*.85,l/2],[.17,.26,l]);
                this.part(g,'ring','cream',[0,h*.5,-.1],[.5,.5,.5]);
                for (const z of [2,6,10,14]) for (const side of [-1,1]) this.part(g,'sphere','dark',[side*w*.48,.45,z],[.32,.32,.32]);
                for (const z of [2,5,8,11,14]) this.part(g,'box','trim',[0,h+.101,z],[w*.94,.015,.055], [0,0,0],false);
            } else if (this.id === 'pond') {
                this.part(g,'box','dark',[0,h*.55,-.08],[w*.85,h*.72,.15]);
                for(const x of [-.65,.65]) this.part(g,'ring','trim',[x,h*.55,-.18],[.35,.35,.35]);
                for (const z of [2,5,8,11,14]) for(const side of [-1,1]) this.part(g,'box','dark',[side*w*.48,h*.48,z],[.12,h*.8,1.8]);
            } else {
                for (const t of [.28,.57,.85]) {
                    this.part(g,'box','trim',[0,h*t,l/2],[w+.025,.06,l+.035]);
                    for(const side of [-1,1]) this.part(g,'box','cream',[side*(w/2+.02),h*t+.15,l/2],[.05,.035,l*.92]);
                }
                this.part(g,'box','dark',[0,.12,l/2],[w,.16,l]);
            }
        } else if (type === 'jump') {
            if (this.id === 'pond' || this.id === 'tea') {
                this.part(g,'cylinder',this.id==='tea'?'dark':'hazard',[0,h/2,0],[w*.44,h,.46]);
                this.part(g,'cylinder','cream',[0,h-.03,0],[w*.44,.07,.46]);
                if(this.id==='pond') for(const side of [-1,1]) this.part(g,'box','dark',[side*w*.34,h*.5,-.4],[.06,h*.7,.06]);
            } else {
                this.part(g,'box','hazard',[0,h/2,0],[w,h,.65]);
                for (let i=0;i<6;i++) this.part(g,'box','body',[(i-2.5)*w/7,h/2,-.34],[.04,h*.75,.03], [0,0,0],false);
                if(this.id==='laundry') this.part(g,'sphere','cream',[0,h-.12,0],[w*.35,.2,.25]);
            }
            this.part(g,'box','dark',[0,h*.6,-.4],[.65,.66,.04]);
            this.part(g,'arrow','mark',[0,h*.6,-.43],[.6,.6,.6], [0,0,0],false).name='jumpArrow';
        } else if (type === 'slide') {
            for (const side of [-1,1]) {
                this.part(g,'box','dark',[side*(w/2-.1),h/2,0],[.14,h,.16]);
                this.part(g,'box','body',[side*(w/2-.1),.09,0],[.34,.18,.35]);
            }
            const beamH=h-clearanceY;
            this.part(g,'box',this.id==='laundry'?'trim':'hazard',[0,clearanceY+beamH/2,0],[w,beamH,.24]);
            for(const side of [-1,1]) this.part(g,'box','cream',[side*w*.32,clearanceY+beamH/2,-.14],[.12,beamH*.8,.025],[0,0,.2],false);
            this.part(g,'arrow','mark',[0,clearanceY+beamH/2,-.15],[.85,.85,.85],[0,0,Math.PI],false).name='slideArrow';
            if(this.id==='laundry') for(const side of [-1,1]) this.part(g,'box','body',[side*w*.4,h+.12,0],[.10,.26,.20]);
        } else if(type==='feature') {
            this.part(g,'box','feature',[0,.015,0],[CONFIG.LANE_WIDTH*.83,.04,7],[0,0,0],false);
            for (const z of [-2.3,0,2.3]) this.part(g,'arrow','mark',[0,.044,z],[1.1,1.1,1.1],[Math.PI/2,0,0],false);
            if(this.id !== 'store') {
                // The spring/air marker is flat: it never adds an unmodelled collision step.
                this.part(g,'ring','cream',[0,.07,-1.6],[.7,.7,.7],[Math.PI/2,0,0],false);
            }
        }
        return g;
    }

    dispose() {
        Object.values(this.geometries).forEach(g=>g.dispose());
        Object.values(this.materials).forEach(m=>m.dispose());
    }
}

export class MapFeature3D {
    constructor(scene,kit,lane,z) {
        this.scene=scene; this.lane=lane; this.z=z; this.length=7; this.triggered=false;
        this.mesh=kit.create('feature',{}); this.mesh.position.set(-lane*CONFIG.LANE_WIDTH,0,z); scene.add(this.mesh);
    }
    destroy() { this.scene.remove(this.mesh); }
}
