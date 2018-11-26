/**
 * External dependencies.
 */
import { Component } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';

/**
 * The internal dependencies.
 */
import './style.scss';
import FieldBase from '../../components/field-base';
import NoOptions from '../../components/no-options';
import validator from '../../validators/required';

class RadioField extends Component {
	/**
	 * Handles the change of the input.
	 *
	 * @param {Object} e
	 * @return {void}
	 */
	handleChange = ( e ) => {
		const { id, onChange } = this.props;

		onChange( id, e.target.value );
	}

	/**
	 * Renders the radio options
	 *
	 * @return {Object}
	 */
	renderOptions() {
		const {
			id,
			field,
			value,
			name
		} = this.props;

		return (
			<ul className="cf-radio__list">
				{ field.options.map( ( option, index ) => (
					<li className="cf-radio__list-item" key={ index }>
						<input
							type="radio"
							id={ `${ id }-${ option.value }` }
							name={ name }
							value={ option.value }
							checked={ value === option.value }
							className="cf-radio__input"
							onChange={ this.handleChange }
							{ ...field.attributes }
						/>

						<label className="cf-radio__label" htmlFor={ `${ id }-${ option.value }` }>
							{ option.label }
						</label>
					</li>
				) ) }
			</ul>
		);
	}

	/**
	 * Renders the component.
	 *
	 * @return {Object}
	 */
	render() {
		const { field } = this.props;

		return (
			<FieldBase field={ field } >
				{ field.options.length > 0
					? this.renderOptions()
					: <NoOptions />
				}
			</FieldBase>
		);
	}
}

addFilter( 'carbon-fields.radio.validate', 'carbon-fields/core', ( field, value ) => validator( value ) );
addFilter( 'carbon-fields.radio_image.validate', 'carbon-fields/core', ( field, value ) => validator( value ) );

export default RadioField;
