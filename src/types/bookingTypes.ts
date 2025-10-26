// Types for booking and venue data




export type Closure = {
  closureID?: number;
  startTimestamp: string; // ISO timestamp string with time and date
  durationMinutes: number; // number of minutes the closure lasts. e.g., 60 for 1 hour
  recurringType: string | null;
  reason: string | null;
};


export type CourtWithClosures = {
  courtID: number;
  courtDescription: string | null;
  closures: Closure[];
};

export type VenueData = {
  venueID: number;
  venueLogo: string;
  venueBrand: string;
  venueSlogan: string;

  venueTheme: string;
  venueAddress: string;
  venueCourtCarouselImages: string[];
  venueDescription: { icon: string, title: string, description: string }[];
  venueContactDetails: { icon: string, title: string, description: string }[];
}

export type daySettingsType = {
  [day: string]:
  {
    openTime: string | null;
    closeTime: string | null;
    is_day_bookable: boolean | undefined;
  };
}
export type VenueSettings = {
  bookingCoolDown: number | null; // an input type number for amount of minutes
  slotGenerationInterval: number | null; // an input to input number of minutes to generate bookable times for
  maxBookingDurationMinutes: number | null; // an input for max bookable duration. in hours
  bookingPerPerson: number | null; // an input for max booking per person. in number
  minBookingNoticeMinutes: number | null; // an input giving the minimum time in hours to allow a booking to be booked. say (6 hours before that time comes around)
  maxBookingNoticeMinutes: number | null; // an input giving the maximum time in days to allow a booking to be booked. say (2 months before that time comes around)
  maxCancellationNoticeMinutes: number | null; // an input giving the maximum time in hours to allow a booking to be cancelled. say (1 hour before that time comes around)
  daySettings: daySettingsType | null; // this one we already handled
  currency: string | null;
};

export type courtType = {
  courtID: number;
  approvalStatus: string,
  name: string;
  units: Unit[] | null;
}
export type courtsType = courtType[];



// A sub-unit of a venue (things inside a unit that can be booked individually)
export type SubUnit = {
  id: number;
  description: string;
  price: number;
};

// A unit is a main resource (court, hall, etc.)
export type Unit = {
  unitID: number;
  title: string;
  subUnits: SubUnit[];
};

// What `get_units_from_booking` returns
export interface BookingDetails {
  bookingID?: number;
  courtStatus: string;
  courtID: number;
  startTime: string; // ISO timestamp
  endTime: string;   // ISO timestamp
  status: string;
  units: Unit; // single unit per booking
}

// The user info
export interface UserInfo {
  userID: string;  // UUID
  name: string;
  email: string;
  phone: string;
}

// The payment info
export interface PaymentInfo {
  paymentID: number | null;
  amount: number | null;
  currency: string | null;       // e.g., "LKR"
  status: string | null;         // e.g., "pending", "paid"
  paymentMethod: string | null;  // e.g., "card"
  provider: string | null;       // e.g., "Payhere"
  providerRef: string | null;
}

// One booking entry in the day array
export interface BookingEntry {
  details: BookingDetails;
  user?: UserInfo;
  payment?: PaymentInfo;
}

export interface BookingsByDate { date: Date, entries: BookingDetails[]; } // for bookingDayDate

// The return type of get_bookings_by_day_for_venue
export interface BookingsForDateRange {
  [date: string]: BookingEntry[]; // key = date string "YYYY-MM-DD", value = array of bookings
}

export type UserBookings = BookingDetails[];
