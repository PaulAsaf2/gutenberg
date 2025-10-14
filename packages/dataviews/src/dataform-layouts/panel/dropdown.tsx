/**
 * WordPress dependencies
 */
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	__experimentalSpacer as Spacer,
	Dropdown,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useMemo } from '@wordpress/element';
import { closeSmall } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import type { Form, FormField, NormalizedField } from '../../types';
import { DataFormLayout } from '../data-form-layout';
import { isCombinedField } from '../is-combined-field';
import { DEFAULT_LAYOUT } from '../normalize-form-fields';
import SummaryButton from './summary-button';
import useFocusOnFormInput from './use-focus-on-form-input';

function DropdownHeader( {
	title,
	onClose,
}: {
	title?: string;
	onClose: () => void;
} ) {
	return (
		<VStack
			className="dataforms-layouts-panel__dropdown-header"
			spacing={ 4 }
		>
			<HStack alignment="center">
				{ title && (
					<Heading level={ 2 } size={ 13 }>
						{ title }
					</Heading>
				) }
				<Spacer />
				{ onClose && (
					<Button
						label={ __( 'Close' ) }
						icon={ closeSmall }
						onClick={ onClose }
						size="small"
					/>
				) }
			</HStack>
		</VStack>
	);
}

function DropdownContent< Item >( {
	onClose,
	fieldLabel,
	data,
	form,
	onChange,
}: {
	onClose: () => void;
	fieldLabel?: string;
	data: Item;
	form: Form;
	onChange: ( value: any ) => void;
} ) {
	const focusOnMountRef = useFocusOnFormInput();

	return (
		<>
			<DropdownHeader title={ fieldLabel } onClose={ onClose } />
			<div ref={ focusOnMountRef }>
				<DataFormLayout
					data={ data }
					form={ form }
					onChange={ onChange }
				>
					{ ( FieldLayout, nestedField ) => (
						<FieldLayout
							key={ nestedField.id }
							data={ data }
							field={ nestedField }
							onChange={ onChange }
							hideLabelFromVision={
								( form?.fields ?? [] ).length < 2
							}
						/>
					) }
				</DataFormLayout>
			</div>
		</>
	);
}

function PanelDropdown< Item >( {
	fieldDefinition,
	summaryFields,
	popoverAnchor,
	labelPosition = 'side',
	data,
	onChange,
	field,
}: {
	fieldDefinition: NormalizedField< Item >;
	summaryFields: NormalizedField< Item >[];
	popoverAnchor: HTMLElement | null;
	labelPosition: 'side' | 'top' | 'none';
	data: Item;
	onChange: ( value: any ) => void;
	field: FormField;
} ) {
	const fieldLabel = isCombinedField( field )
		? field.label
		: fieldDefinition?.label;

	const form: Form = useMemo(
		(): Form => ( {
			layout: DEFAULT_LAYOUT,
			fields: isCombinedField( field )
				? field.children
				: // If not explicit children return the field id itself.
				  [ { id: field.id } ],
		} ),
		[ field ]
	);

	// Memoize popoverProps to avoid returning a new object every time.
	const popoverProps = useMemo(
		() => ( {
			// Anchor the popover to the middle of the entire row so that it doesn't
			// move around when the label changes.
			anchor: popoverAnchor,
			placement: 'left-start',
			offset: 36,
			shift: true,
		} ),
		[ popoverAnchor ]
	);

	return (
		<Dropdown
			contentClassName="dataforms-layouts-panel__field-dropdown"
			popoverProps={ popoverProps }
			focusOnMount={ false }
			toggleProps={ {
				size: 'compact',
				variant: 'tertiary',
				tooltipPosition: 'middle left',
			} }
			renderToggle={ ( { isOpen, onToggle } ) => (
				<SummaryButton
					summaryFields={ summaryFields }
					data={ data }
					labelPosition={ labelPosition }
					fieldLabel={ fieldLabel }
					disabled={ fieldDefinition.readOnly === true }
					onClick={ onToggle }
					aria-expanded={ isOpen }
				/>
			) }
			renderContent={ ( { onClose } ) => (
				<DropdownContent
					onClose={ onClose }
					fieldLabel={ fieldLabel }
					data={ data }
					form={ form }
					onChange={ onChange }
				/>
			) }
		/>
	);
}

export default PanelDropdown;
