'use client';

import { Drawer } from 'vaul';
import { Button, ResponsiveDrawer } from '@/components/ui';
import { getDoctorReviews } from '@/features/doctor-reviews/data/mock-doctor-reviews';
import { useDoctorReviewsStore } from '@/features/doctor-reviews/store/doctor-reviews-store';
import { useMapAppointmentStore } from '@/features/map-appointment/store/map-appointment-store';
import { useRequireAuth } from '@/features/phone-auth/hooks/use-require-auth';
import { DoctorRating } from '@/features/map/ui/doctor-rating';
import type { DoctorReview } from '@/features/map/types';

function ReviewStars({ rating }: { rating: number }) {
  const filledStars = Math.min(5, Math.max(0, Math.round(rating)));

  return (
    <div className="flex items-center" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <svg
          key={index}
          viewBox="0 0 20 20"
          className={`h-3.5 w-3.5 ${
            index < filledStars ? 'text-amber-400' : 'text-slate-300'
          }`}
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: DoctorReview }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-slate-900">{review.authorName}</p>
          <p className="text-xs text-slate-500">
            {new Date(review.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
        <ReviewStars rating={review.rating} />
      </div>
      <p className="text-sm leading-6 text-slate-700">{review.comment}</p>
    </article>
  );
}

export function DoctorReviewsDrawer() {
  const reviewsOpen = useDoctorReviewsStore((state) => state.reviewsOpen);
  const setReviewsOpen = useDoctorReviewsStore((state) => state.setReviewsOpen);
  const selectedDoctor = useDoctorReviewsStore((state) => state.selectedDoctor);
  const { requireAuth } = useRequireAuth();
  const openAppointment = useMapAppointmentStore((state) => state.openAppointment);

  const reviews = selectedDoctor ? getDoctorReviews(selectedDoctor.id) : [];

  function handleOpenAppointment() {
    if (!selectedDoctor) {
      return;
    }

    requireAuth({ type: 'appointment', doctor: selectedDoctor }, () => {
      setReviewsOpen(false);
      openAppointment(selectedDoctor);
    });
  }

  return (
    <ResponsiveDrawer open={reviewsOpen} onOpenChange={setReviewsOpen}>
      <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col">
              <Drawer.Title className="mb-4 font-medium text-gray-900">
                Patient reviews
              </Drawer.Title>

              {selectedDoctor ? (
                <>
                  <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <img
                      src={selectedDoctor.profileImageUrl}
                      alt={`${selectedDoctor.firstName} ${selectedDoctor.lastName}`}
                      className="h-14 w-14 rounded-full border border-slate-200 object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {selectedDoctor.firstName} {selectedDoctor.lastName}
                      </p>
                      <p className="text-sm text-teal-700">
                        {selectedDoctor.specialty}
                      </p>
                      <DoctorRating
                        rating={selectedDoctor.rating}
                        reviewCount={selectedDoctor.reviewCount}
                      />
                    </div>
                  </div>

                  <p className="mb-3 text-sm text-slate-500">
                    Showing {reviews.length} recent reviews of{' '}
                    {selectedDoctor.reviewCount}
                  </p>

                  <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pb-2">
                    {reviews.length > 0 ? (
                      reviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                      ))
                    ) : (
                      <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                        No reviews yet.
                      </p>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <Button
                      variant="secondary"
                      fullWidth
                      onClick={() => setReviewsOpen(false)}
                    >
                      Close
                    </Button>
                    <Button fullWidth onClick={handleOpenAppointment}>
                      Appointment
                    </Button>
                  </div>
                </>
              ) : null}
      </div>
    </ResponsiveDrawer>
  );
}
