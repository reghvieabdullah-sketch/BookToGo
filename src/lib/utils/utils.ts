export function getStatusBadgeClass(status?: string) {
    switch (status && status.toLowerCase()) {
        case 'paid':
            return 'badge-success';
        case 'unpaid':
            return 'badge-warning';
        case 'upcoming':
            return 'badge-info';
        case 'past':
            return 'badge-neutral';
    }
}


export function getPaymentStatusBadgeClass(status: string) {
    switch (status.toLowerCase()) {
        case 'paid':
            return 'badge-success';
        case 'pending':
            return 'badge-warning';
        case 'refunded':
            return 'badge-info';
        default:
            return 'badge-neutral';
    }
}


import * as XLSX from 'xlsx';
import type { BookingsForDateRange } from '../../types/bookingTypes';


function formatTimeForTimezone( isoTimestamp: string, timeZone: string ): string {
	return new Intl.DateTimeFormat('en-GB', {
		timeZone,
		hour: '2-digit',
		minute: '2-digit',
		hour12: true
	}).format(new Date(isoTimestamp));
}
export function generateBookingsExcel( bookingsByDate: BookingsForDateRange, startDate: string, endDate: string, timeZone: string ): Response {
	const rows: Record<string, string | number>[] = [];

	for (const [date, bookings] of Object.entries(bookingsByDate)) {
		for (const booking of bookings) {
            
			const row: Record<string, string | number> = {
				'Booking Date': date,

				'Start Time': formatTimeForTimezone(
					booking.details.startTime,
					timeZone
				),

				'End Time': formatTimeForTimezone(
					booking.details.endTime,
					timeZone
				),

				'Court': booking.details.units?.title ?? '',
				'Booking Status': booking.details.status ?? '',
			};

			if (booking.user) {
				row['Customer Name'] = booking.user.name;
				row['Customer Email'] = booking.user.email;
				row['Customer Phone'] = booking.user.phone;
			}

			if (booking.payment) {
				if (booking.payment.amount !== null) {
					row['Payment Amount'] = booking.payment.amount;
				}

				if (booking.payment.currency !== null) {
					row['Payment Currency'] = booking.payment.currency;
				}

				if (booking.payment.status !== null) {
					row['Payment Status'] = booking.payment.status;
				}

				if (booking.payment.paymentMethod !== null) {
					row['Payment Method'] = booking.payment.paymentMethod;
				}

				if (booking.payment.provider !== null) {
					row['Payment Provider'] = booking.payment.provider;
				}
			}

			const subUnitDescriptions = (
				booking.details.units?.subUnits ?? []
			)
				.map((subUnit) => subUnit.description)
				.filter(
					(description): description is string =>
						Boolean(description)
				);

			if (subUnitDescriptions.length > 0) {
				row['Sub-units'] = subUnitDescriptions.join(', ');
			}

			rows.push(row);
         
		}
	}

	const worksheet = XLSX.utils.json_to_sheet(rows);

	worksheet['!cols'] = [
		{ wch: 16 }, // Booking Date
		{ wch: 24 }, // Start Time
		{ wch: 24 }, // End Time
		{ wch: 25 }, // Court
		{ wch: 18 }, // Booking Status
		{ wch: 25 }, // Customer Name
		{ wch: 30 }, // Customer Email
		{ wch: 20 }, // Customer Phone
		{ wch: 18 }, // Payment Amount
		{ wch: 18 }, // Payment Currency
		{ wch: 18 }, // Payment Status
		{ wch: 20 }, // Payment Method
		{ wch: 20 }, // Payment Provider
		{ wch: 35 }  // Sub-units
	];

	const workbook = XLSX.utils.book_new();

	XLSX.utils.book_append_sheet(
		workbook,
		worksheet,
		'Bookings'
	);

	const excelBuffer = XLSX.write(workbook, {
		type: 'buffer',
		bookType: 'xlsx'
	});

	const filename = `${startDate}_${endDate}_bookings.xlsx`;

	return new Response(excelBuffer, {
		status: 200,
		headers: {
			'Content-Type':
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'Content-Disposition': `attachment; filename="${filename}"`,
			'Content-Length': String(excelBuffer.length)
		}
	});
}
