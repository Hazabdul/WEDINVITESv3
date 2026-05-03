import fs from 'fs';
const file = 'frontend/src/pages/Builder.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /function PreviewFrame\(\{ mode, children \}\) \{[\s\S]*?export function Builder\(/;
const newPreviewFrame = `function PreviewFrame({ children }) {
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

export function Builder(`;

content = content.replace(regex, newPreviewFrame);

fs.writeFileSync(file, content);
console.log('Fixed PreviewFrame');
