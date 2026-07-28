export interface Review {
  id: number;
  reviewerName: string;
  reviewText: string;
  reviewDate: string | null;
  googleReviewUrl: string | null;
  sortOrder: number;
}

export type ReviewRequest = Omit<Review, 'id' | 'sortOrder'>;
