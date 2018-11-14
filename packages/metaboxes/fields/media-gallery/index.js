/**
 * External dependencies.
 */
import { addFilter } from '@wordpress/hooks';

/**
 * The internal dependencies.
 */
import withField from '../../components/with-field';

addFilter( 'carbon-fields.media_gallery-field.metabox', 'carbon-fields/metaboxes', ( OriginalMediaGalleryField ) => withField( OriginalMediaGalleryField ) );
