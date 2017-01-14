/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import InlineAutoformatEngine from '../src/inlineautoformatengine';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

testUtils.createSinonSandbox();

describe( 'InlineAutoformatEngine', () => {
	let editor, doc, batch;

	beforeEach( () => {
		return VirtualTestEditor.create( {
			plugins: [ Enter, Paragraph ]
		} )
		.then( newEditor => {
			editor = newEditor;
			doc = editor.document;
			batch = doc.batch();
			doc.schema.allow( { name: '$inline', attributes: [ 'testAttribute' ] } );
		} );
	} );

	describe( 'attribute', () => {
		it( 'should stop early if there are less than 3 capture groups', () => {
			new InlineAutoformatEngine( editor, /(\*)(.+?)\*/g, 'testAttribute' );

			setData( doc, '<paragraph>*foobar[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), '*' );
			} );

			expect( getData( doc ) ).to.equal( '<paragraph>*foobar*[]</paragraph>' );
		} );

		it( 'should apply an attribute when the pattern is matched', () => {
			new InlineAutoformatEngine( editor, /(\*)(.+?)(\*)/g, 'testAttribute' );

			setData( doc, '<paragraph>*foobar[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), '*' );
			} );

			expect( getData( doc ) ).to.equal( '<paragraph><$text testAttribute="true">foobar</$text>[]</paragraph>' );
		} );

		it( 'should stop early if selection is not collapsed', () => {
			new InlineAutoformatEngine( editor, /(\*)(.+?)\*/g, 'testAttribute' );

			setData( doc, '<paragraph>*foob[ar]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), '*' );
			} );

			expect( getData( doc ) ).to.equal( '<paragraph>*foob*[ar]</paragraph>' );
		} );
	} );

	describe( 'Callback', () => {
		it( 'should stop when there are no format ranges returned from testCallback', () => {
			const formatSpy = testUtils.sinon.spy();
			const testStub = testUtils.sinon.stub().returns( {
				format: [ [] ],
				remove: []
			} );

			new InlineAutoformatEngine( editor, testStub, formatSpy );

			setData( doc, '<paragraph>*[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			sinon.assert.notCalled( formatSpy );
		} );

		it( 'should stop when there are no remove ranges returned from testCallback', () => {
			const formatSpy = testUtils.sinon.spy();
			const testStub = testUtils.sinon.stub().returns( {
				format: [],
				remove: [ [] ]
			} );

			new InlineAutoformatEngine( editor, testStub, formatSpy );

			setData( doc, '<paragraph>*[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			sinon.assert.notCalled( formatSpy );
		} );

		it( 'should stop early when there is no text', () => {
			const formatSpy = testUtils.sinon.spy();
			const testStub = testUtils.sinon.stub().returns( {
				format: [],
				remove: [ [] ]
			} );

			new InlineAutoformatEngine( editor, testStub, formatSpy );

			setData( doc, '<paragraph>[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			sinon.assert.notCalled( formatSpy );
		} );
	} );
} );
