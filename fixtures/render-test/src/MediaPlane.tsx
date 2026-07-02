import React, { useEffect, useRef, useState } from 'react';
import {
    usePluridPlane,
} from '@plurid/plurid-react';


// A CONSUMER-STYLE media plane - the depict/deview pattern built on the
// substrate seams, exactly as the "building a media plane as a consumer"
// recipe describes. The engine ships NO media components; this panel proves
// the plane-content API carries a media app:
//   - usePluridPlane() lens -> live signals (active/selected/isolation/shown/scale)
//   - pause the video when the plane is not active / another plane is isolated
//   - lazy indicators driven by the lens, published for test assertions
//   - NO autoplay - playback is button-driven (granular-control principle)
const IMAGE_SOURCE = 'data:image/svg+xml;utf8,'
    + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="140">'
        + '<rect width="240" height="140" fill="#12161c"/>'
        + '<circle cx="70" cy="70" r="42" fill="#4da3ff"/>'
        + '<rect x="130" y="36" width="84" height="68" fill="#7ee787"/>'
        + '</svg>',
    );

// a 1-frame silent webm-less fallback: use a data-URI-less <video> with no
// source; the harness only asserts paused-ness + control wiring, not decode.

const MediaPlane: React.FC = () => {
    const lens = usePluridPlane();
    const videoElement = useRef<HTMLVideoElement | null>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [playing, setPlaying] = useState(false);

    // publish the live lens for test assertions
    useEffect(() => {
        (window as any).__rtPlaneLens = {
            planeID: lens.planeID,
            active: lens.active,
            selected: lens.selected,
            isolation: lens.isolation,
            shown: lens.shown,
            scale: lens.scale,
        };
    }, [lens.planeID, lens.active, lens.selected, lens.isolation, lens.shown, lens.scale]);

    // the recipe's pause rule: not active, or another plane isolated -> pause
    useEffect(() => {
        const video = videoElement.current;
        if (!video) {
            return;
        }
        if (
            playing
            && (!lens.active || lens.isolation === 'other' || !lens.shown)
        ) {
            video.pause();
            setPlaying(false);
        }
    }, [playing, lens.active, lens.isolation, lens.shown]);

    return (
        <div
            style={{
                width: 280,
                padding: 14,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                color: '#cfe6ff',
            }}
        >
            <div style={{ fontSize: 11, letterSpacing: '0.1em', marginBottom: 8 }}>
                MEDIA - {lens.planeID ?? 'no-plane'}
                {lens.active ? ' [active]' : ''}
            </div>

            <img
                src={IMAGE_SOURCE}
                alt="media fixture"
                style={{ width: '100%', display: 'block', borderRadius: 4 }}
                onLoad={() => {
                    setImageLoaded(true);
                    (window as any).__rtMediaImageLoaded = true;
                }}
            />

            <video
                ref={videoElement}
                muted
                playsInline
                style={{ width: '100%', marginTop: 8, background: '#0d0f12', minHeight: 40 }}
                data-rt-media-video
            />

            <button
                onClick={() => {
                    const video = videoElement.current;
                    if (!video) {
                        return;
                    }
                    if (playing) {
                        video.pause();
                        setPlaying(false);
                    } else {
                        // no source attached - play() rejects harmlessly; the
                        // harness asserts the CONTROL wiring, not decoding
                        video.play().catch(() => {});
                        setPlaying(true);
                    }
                }}
                style={{
                    marginTop: 8, padding: '4px 10px', fontSize: 11,
                    cursor: 'pointer', borderRadius: 4,
                    border: '1px solid #ffffff22', background: '#0d0f12cc',
                    color: playing ? '#7ee787' : '#aab2bd',
                }}
            >
                {playing ? 'PAUSE' : 'PLAY'}
            </button>

            <div style={{ fontSize: 10, marginTop: 8, color: '#aab2bd' }}>
                img {imageLoaded ? 'loaded' : 'pending'}
                {' - '}scale {lens.scale.toFixed(3)}
                {' - '}isolation {lens.isolation}
            </div>
        </div>
    );
};


export default MediaPlane;
