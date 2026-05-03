import fs from 'fs';
const file = 'frontend/src/pages/Builder.jsx';
let content = fs.readFileSync(file, 'utf8');

// Fix video upload missing "video" state
content = content.replace(
  "updateSection('media', 'videoStory', response.url);",
  "updateSection('media', 'videoStory', response.url);\n        updateSection('media', 'video', response.url);"
);

// Revert preview back to only mobile mockup
content = content.replace(
  /function PreviewFrame\(\{(.|\n)*?export function Builder\(/,
  `function PreviewFrame({ children }) {
  return (
    <div className="mx-auto w-[375px] relative">
      <div className="rounded-[40px] border-[12px] border-[#1a1a1a] bg-[#1a1a1a] p-1 shadow-2xl relative z-10">
        <div className="overflow-hidden rounded-[28px] bg-white relative">
          <div className="absolute top-0 inset-x-0 flex items-center justify-center pt-3 z-50 pointer-events-none">
            <div className="h-6 w-32 rounded-full bg-[#1a1a1a]" />
          </div>
          <div className="overflow-y-auto custom-scrollbar-preview rounded-b-[28px] h-[667px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Builder(`
);

// Hide or remove desktop/mobile toggle from preview controls
content = content.replace(
  /<div className="hidden lg:flex items-center gap-1 rounded-xl bg-slate-100\/80 p-1 backdrop-blur-sm">(.|\n)*?<\/div>/,
  ''
);

// Always use mobile preview mode width scaling
content = content.replace(
  /previewMode === 'desktop' \? "w-\[414px\].*?mx-auto"/,
  '"w-[375px] scale-[0.88] origin-top mx-auto"'
);

// remove <PreviewFrame mode={previewMode}>
content = content.replace(
  /<PreviewFrame mode=\{previewMode\}>/,
  '<PreviewFrame>'
);

fs.writeFileSync(file, content);
console.log('Fixed Builder.jsx');
