import { File, Folder, Tree } from "@/components/ui/file-tree";


export type TreeLeaf = {
  id: string;
  name: string;
};

interface Props {
  frFiles: TreeLeaf[];
  enFiles: TreeLeaf[];
}

export default function AboutTree({ frFiles, enFiles }: Props) {
  return (
    <Tree
      className="h-full overflow-hidden font-mono text-sm"
      initialExpandedItems={["shared", "content", "blog", "fr"]}
    >
      <Folder element="shared" value="shared">
        <Folder element="content" value="content">
          <Folder element="blog" value="blog">
            <Folder element="fr" value="fr">
              {frFiles.map((file) => (
                <File key={file.id} value={file.id}>
                  <span>{file.name}</span>
                </File>
              ))}
            </Folder>
            <Folder element="en" value="en">
              {enFiles.map((file) => (
                <File key={file.id} value={file.id}>
                  <span>{file.name}</span>
                </File>
              ))}
            </Folder>
          </Folder>
        </Folder>
      </Folder>
      <Folder element="versions/h4x0r" value="h4x0r">
        <Folder element="i18n" value="i18n">
          <File value="ui-ts"><span>ui.ts</span></File>
        </Folder>
        <Folder element="styles" value="styles">
          <File value="global-css"><span>global.css</span></File>
        </Folder>
      </Folder>
    </Tree>
  );
}
