/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Autoformat from '../src/autoformat';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ListEditing from '@ckeditor/ckeditor5-list/src/listediting';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';
import CodeEditing from '@ckeditor/ckeditor5-basic-styles/src/code/codeediting';
import ItalicEditing from '@ckeditor/ckeditor5-basic-styles/src/italic/italicediting';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';

import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import Command from '@ckeditor/ckeditor5-core/src/command';

testUtils.createSinonSandbox();

describe( 'Autoformat', () => {
	let editor, model, doc;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [
					Enter,
					Paragraph,
					Autoformat,
					ListEditing,
					HeadingEditing,
					BoldEditing,
					ItalicEditing,
					CodeEditing,
					BlockQuoteEditing
				]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'Bulleted list', () => {
		it( 'should replace asterisk with bulleted list item', () => {
			setData( model, '<paragraph>*[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<listItem indent="0" type="bulleted">[]</listItem>' );
		} );

		it( 'should replace minus character with bulleted list item', () => {
			setData( model, '<paragraph>-[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<listItem indent="0" type="bulleted">[]</listItem>' );
		} );

		it( 'should not replace minus character when inside bulleted list item', () => {
			setData( model, '<listItem indent="0" type="bulleted">-[]</listItem>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<listItem indent="0" type="bulleted">- []</listItem>' );
		} );
	} );

	describe( 'Numbered list', () => {
		it( 'should replace digit with numbered list item using the dot format', () => {
			setData( model, '<paragraph>1.[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<listItem indent="0" type="numbered">[]</listItem>' );
		} );

		it( 'should replace digit with numbered list item using the parenthesis format', () => {
			setData( model, '<paragraph>1)[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<listItem indent="0" type="numbered">[]</listItem>' );
		} );

		it( 'should not replace digit character when there is no . or ) in the format', () => {
			setData( model, '<paragraph>1[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph>1 []</paragraph>' );
		} );

		it( 'should not replace digit character when inside numbered list item', () => {
			setData( model, '<listItem indent="0" type="numbered">1.[]</listItem>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<listItem indent="0" type="numbered">1. []</listItem>' );
		} );
	} );

	describe( 'Heading', () => {
		it( 'should replace hash character with heading', () => {
			setData( model, '<paragraph>#[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<heading1>[]</heading1>' );
		} );

		it( 'should replace two hash characters with heading level 2', () => {
			setData( model, '<paragraph>##[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<heading2>[]</heading2>' );
		} );

		it( 'should not replace hash character when inside heading', () => {
			setData( model, '<heading1>#[]</heading1>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<heading1># []</heading1>' );
		} );

		it( 'should work with heading1-heading6 commands regardless of the config of the heading feature', () => {
			const spy1 = sinon.spy();
			const spy6 = sinon.spy();

			class Heading6 extends Command {
				execute() {
					spy6();
				}
			}
			class Heading1 extends Command {
				execute() {
					spy1();
				}
			}

			function HeadingPlugin( editor ) {
				editor.commands.add( 'heading1', new Heading1( editor ) );
				editor.commands.add( 'heading6', new Heading6( editor ) );
			}

			return VirtualTestEditor
				.create( {
					plugins: [
						Paragraph, Autoformat, HeadingPlugin
					]
				} )
				.then( editor => {
					const model = editor.model;
					const doc = model.document;

					setData( model, '<paragraph>#[]</paragraph>' );
					model.change( writer => {
						writer.insertText( ' ', doc.selection.getFirstPosition() );
					} );

					expect( spy1.calledOnce ).to.be.true;

					setData( model, '<paragraph>######[]</paragraph>' );
					model.change( writer => {
						writer.insertText( ' ', doc.selection.getFirstPosition() );
					} );

					expect( spy6.calledOnce ).to.be.true;

					return editor.destroy();
				} );
		} );
	} );

	describe( 'Block quote', () => {
		it( 'should replace greater-than character with block quote', () => {
			setData( model, '<paragraph>>[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<blockQuote><paragraph>[]</paragraph></blockQuote>' );
		} );

		it( 'should not replace greater-than character when inside heading', () => {
			setData( model, '<heading1>>[]</heading1>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<heading1>> []</heading1>' );
		} );

		it( 'should not replace greater-than character when inside numbered list', () => {
			setData( model, '<listItem indent="0" type="numbered">1. >[]</listItem>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<listItem indent="0" type="numbered">1. > []</listItem>' );
		} );

		it( 'should not replace greater-than character when inside buletted list', () => {
			setData( model, '<listItem indent="0" type="bulleted">1. >[]</listItem>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<listItem indent="0" type="bulleted">1. > []</listItem>' );
		} );
	} );

	describe( 'Inline autoformat', () => {
		it( 'should replace both "**" with bold', () => {
			setData( model, '<paragraph>**foobar*[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph><$text bold="true">foobar</$text>[]</paragraph>' );
		} );

		it( 'should replace both "*" with italic', () => {
			setData( model, '<paragraph>*foobar[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph><$text italic="true">foobar</$text>[]</paragraph>' );
		} );

		it( 'should replace both "`" with code', () => {
			setData( model, '<paragraph>`foobar[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '`', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph><$text code="true">foobar</$text>[]</paragraph>' );
		} );

		it( 'nothing should be replaces when typing "*"', () => {
			setData( model, '<paragraph>foobar[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph>foobar*[]</paragraph>' );
		} );

		it( 'should format inside the text', () => {
			setData( model, '<paragraph>foo **bar*[] baz</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph>foo <$text bold="true">bar</$text>[] baz</paragraph>' );
		} );
	} );

	describe( 'without commands', () => {
		beforeEach( () => {
			return VirtualTestEditor
				.create( {
					plugins: [ Enter, Paragraph, Autoformat ]
				} )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					doc = model.document;
				} );
		} );

		it( 'should not replace asterisk with bulleted list item', () => {
			setData( model, '<paragraph>*[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph>* []</paragraph>' );
		} );

		it( 'should not replace minus character with bulleted list item', () => {
			setData( model, '<paragraph>-[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph>- []</paragraph>' );
		} );

		it( 'should not replace digit with numbered list item', () => {
			setData( model, '<paragraph>1.[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph>1. []</paragraph>' );
		} );

		it( 'should not replace hash character with heading', () => {
			setData( model, '<paragraph>#[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph># []</paragraph>' );
		} );

		it( 'should not replace two hash characters with heading level 2', () => {
			setData( model, '<paragraph>##[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph>## []</paragraph>' );
		} );

		it( 'should not replace both "**" with bold', () => {
			setData( model, '<paragraph>**foobar*[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph>**foobar**[]</paragraph>' );
		} );

		it( 'should not replace both "*" with italic', () => {
			setData( model, '<paragraph>*foobar[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph>*foobar*[]</paragraph>' );
		} );

		it( 'should not replace both "`" with code', () => {
			setData( model, '<paragraph>`foobar[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '`', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph>`foobar`[]</paragraph>' );
		} );

		it( 'should not replace ">" with block quote', () => {
			setData( model, '<paragraph>>[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph>> []</paragraph>' );
		} );

		it( 'should use only configured headings', () => {
			return VirtualTestEditor
				.create( {
					plugins: [ Enter, Paragraph, Autoformat, ListEditing, HeadingEditing ],
					heading: {
						options: [
							{ model: 'paragraph' },
							{ model: 'heading1', view: 'h2' }
						]
					}
				} )
				.then( editor => {
					model = editor.model;
					doc = model.document;

					setData( model, '<paragraph>##[]</paragraph>' );
					model.change( writer => {
						writer.insertText( ' ', doc.selection.getFirstPosition() );
					} );

					expect( getData( model ) ).to.equal( '<paragraph>## []</paragraph>' );
				} );
		} );
	} );
} );
