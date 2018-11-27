/**
 * External dependencies.
 */
import of from 'callbag-of';
import { Component, Fragment } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { withEffects, toProps } from 'refract-callbag';
import { debounce } from 'lodash';
import {
	map,
	pipe,
	merge
} from 'callbag-basics';

/**
 * The internal dependencies.
 */
import './style.scss';
import validator from '../../validators/required';
import SearchInput from '../../components/search-input';
import GoogleMap from './google-map';

class MapField extends Component {
	/**
	 * Handles the change of search.
	 *
	 * @param  {string} address
	 * @return {void}
	 */
	handleSearchChange = debounce( ( address ) => {
		if ( address ) {
			this.props.onGeocodeAddress( { address } );
		}
	}, 250 )

	/**
	 * Handles the change of map location.
	 *
	 * @param  {Object} location
	 * @return {void}
	 */
	handleMapChange = ( location ) => {
		const {
			id,
			value,
			onChange
		} = this.props;

		onChange( id, {
			...value,
			...location
		} );
	}

	/**
	 * Renders the component.
	 *
	 * @return {Object}
	 */
	render() {
		const {
			id,
			name,
			value
		} = this.props;

		return (
			<Fragment>
				<SearchInput
					id={ id }
					className="cf-map__search"
					name={ `${ name }[address]` }
					value={ value.address }
					onChange={ this.handleSearchChange }
				/>

				<GoogleMap
					className="cf-map__canvas"
					lat={ value.lat }
					lng={ value.lng }
					zoom={ value.zoom }
					onChange={ this.handleMapChange }
				/>

				<input
					type="hidden"
					name={ `${ name }[lat]` }
					value={ value.lat }
				/>

				<input
					type="hidden"
					name={ `${ name }[lng]` }
					value={ value.lng }
					readOnly
				/>

				<input
					type="hidden"
					name={ `${ name }[zoom]` }
					value={ value.zoom }
					readOnly
				/>
			</Fragment>
		);
	}
}

/**
 * The function that controls the stream of side-effects.
 *
 * @return {Function}
 */
function aperture() {
	return function( component ) {
		const [ geocodeAddress$, geocodeAddress ] = component.useEvent( 'geocodeAddress' );

		const geocodeAddressProps$ = pipe(
			of( {
				onGeocodeAddress: geocodeAddress
			} ),
			map( toProps )
		);

		const geocodeAddressEffect$ = pipe(
			geocodeAddress$,
			map( ( payload ) => ( {
				type: 'GEOCODE_ADDRESS',
				payload: payload
			} ) )
		);

		return merge( geocodeAddressProps$, geocodeAddressEffect$ );
	};
}

/**
 * The function that causes the side effects.
 *
 * @param  {Object} props
 * @return {Function}
 */
function handler( props ) {
	return function( effect ) {
		const { payload, type } = effect;
		const {
			id,
			value,
			onChange
		} = props;

		switch ( type ) {
			case 'GEOCODE_ADDRESS':
				const geocode = ( address ) => {
					return new Promise( ( resolve, reject ) => {
						const geocoder = new window.google.maps.Geocoder();

						geocoder.geocode( { address }, ( results, status ) => {
							if ( status === window.google.maps.GeocoderStatus.OK ) {
								const { location } = results[ 0 ].geometry;

								resolve( {
									lat: location.lat(),
									lng: location.lng()
								} );
							} else if ( status === 'ZERO_RESULTS' ) {
								reject( carbonFieldsL10n.field.geocodeZeroResults );
							} else {
								reject( `${ carbonFieldsL10n.field.geocodeNotSuccessful } ${ status }` );
							}
						} );
					} );
				};

				geocode( payload.address )
					.then( ( { lat, lng } ) => {
						onChange( id, {
							...value,
							address: payload.address,
							value: `${ lat },${ lng }`,
							lat,
							lng
						} );
					} )
					.catch( ( alert ) => {
						// eslint-disable-next-line
						console.log( 'Error alert' );

						// eslint-disable-next-line
						console.log( alert );
					} );

				break;
		}
	};
}

addFilter( 'carbon-fields.map.validate', 'carbon-fields/core', ( field, value ) => validator( value ) );

export default withEffects( handler )( aperture )( MapField );
