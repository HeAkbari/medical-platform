'use client';

import { Button } from '@/components/ui';
import { useDoctorReviewsStore } from '@/features/doctor-reviews/store/doctor-reviews-store';
import { useMapAppointmentStore } from '@/features/map-appointment/store/map-appointment-store';
import { useRequireAuth } from '@/features/phone-auth/hooks/use-require-auth';
import { useMapNavigationStore } from '../store/map-navigation-store';
import type { MapDoctor } from '../types';
import { formatDistanceKm, getDistanceKm } from '../utils/geo';
import { DoctorRating } from './doctor-rating';

interface DoctorMapPopupProps {
  doctor: MapDoctor;
  userPosition: [number, number];
}

export function DoctorMapPopup({ doctor, userPosition }: DoctorMapPopupProps) {
  const openReviews = useDoctorReviewsStore((state) => state.openReviews);
  const { requireAuth } = useRequireAuth();
  const openAppointment = useMapAppointmentStore((state) => state.openAppointment);
  const startNavigation = useMapNavigationStore((state) => state.startNavigation);
  const navigationStatus = useMapNavigationStore((state) => state.status);
  const activeDoctorId = useMapNavigationStore(
    (state) => state.activeDoctor?.id ?? null
  );

  const distanceLabel = formatDistanceKm(
    getDistanceKm(userPosition, doctor.position)
  );
  const isNavigatingDoctor =
    activeDoctorId === doctor.id && navigationStatus === 'loading';
  const isActiveRoute =
    activeDoctorId === doctor.id && navigationStatus === 'success';

  return (
    <div className="min-w-[240px] space-y-3">
      <div className="flex items-center gap-3">
        <img
          src={doctor.profileImageUrl}
          alt={`${doctor.firstName} ${doctor.lastName}`}
          className="h-12 w-12 rounded-full border border-slate-200 object-cover"
        />
        <div>
          <p className="font-semibold text-slate-900">
            {doctor.firstName} {doctor.lastName}
          </p>
          <p className="text-sm text-teal-700">{doctor.specialty}</p>
          <DoctorRating
            rating={doctor.rating}
            reviewCount={doctor.reviewCount}
            onClick={() => openReviews(doctor)}
          />
        </div>
      </div>

      <dl className="space-y-1 text-sm text-slate-600">
        <div className="flex justify-between gap-4">
          <dt>Distance</dt>
          <dd className="font-medium text-slate-800">{distanceLabel}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Phone</dt>
          <dd>{doctor.phone}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Email</dt>
          <dd className="truncate">{doctor.email}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Today</dt>
          <dd>{doctor.availableToday ? 'Available' : 'Unavailable'}</dd>
        </div>
      </dl>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <Button
          variant={isActiveRoute ? 'primary' : 'secondary'}
          fullWidth
          disabled={isNavigatingDoctor}
          onClick={() => startNavigation(doctor, userPosition)}
        >
          {isNavigatingDoctor
            ? 'Loading...'
            : isActiveRoute
              ? 'Navigating'
              : 'Navigate'}
        </Button>
        <Button
          fullWidth
          onClick={() =>
            requireAuth({ type: 'appointment', doctor }, () =>
              openAppointment(doctor)
            )
          }
        >
          Appointment
        </Button>
      </div>
    </div>
  );
}
