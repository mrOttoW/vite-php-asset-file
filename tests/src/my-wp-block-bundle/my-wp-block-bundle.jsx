import './my-wp-block-editor.pcss';
import metadata from './my-wp-block.json';

const { registerBlockType } = wp.blocks;
const { __ } = wp.i18n;
const { useBlockProps } = wp.blockEditor;

export default function Edit() {
  return (
    <p {...useBlockProps()}>
      {__('Example Block – hello from the editor!', 'my-wp-block')}
    </p>
  );
}

registerBlockType(metadata.name, {
  edit: Edit,
});
