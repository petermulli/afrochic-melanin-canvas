import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Review {
  id: string;
  reviewer_name: string;
  review_text: string | null;
  rating: number;
  is_verified_purchase: boolean;
  created_at: string;
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

const ProductReviews = ({ productId, productName }: ProductReviewsProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [userHasPurchased, setUserHasPurchased] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    fetchReviews();
    if (user) {
      checkUserPurchase();
    }
  }, [productId, user]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setReviews(data || []);
      
      // Calculate average rating
      if (data && data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setAverageRating(avg);
      }

      // Check if user has already reviewed
      if (user && data) {
        const hasReviewed = data.some(r => r.user_id === user.id);
        setUserHasReviewed(hasReviewed);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserPurchase = async () => {
    if (!user) return;

    try {
      // Check if user has ordered this product
      const { data: orderItems, error } = await supabase
        .from("order_items")
        .select("id, order_id, orders!inner(user_id, status)")
        .eq("product_id", productId);

      if (error) throw error;

      // Filter for orders belonging to this user with delivered status
      const hasPurchased = orderItems?.some(
        (item: any) => item.orders.user_id === user.id && item.orders.status === "delivered"
      );
      
      setUserHasPurchased(hasPurchased || false);
    } catch (error) {
      console.error("Error checking purchase:", error);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error("Please sign in to leave a review");
      return;
    }

    if (newRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setSubmitting(true);

    try {
      // Get user profile for name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      const reviewerName = profile?.full_name || user.email?.split("@")[0] || "Anonymous";

      const { error } = await supabase.from("product_reviews").insert({
        product_id: productId,
        user_id: user.id,
        rating: newRating,
        review_text: reviewText.trim() || null,
        reviewer_name: reviewerName,
        is_verified_purchase: userHasPurchased,
      });

      if (error) throw error;

      toast.success("Thank you for your review!");
      setShowForm(false);
      setNewRating(0);
      setReviewText("");
      fetchReviews();
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="border-t border-border pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-serif tracking-tight mb-2">Customer Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(averageRating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {averageRating.toFixed(1)} out of 5 ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}
        </div>

        {user && !userHasReviewed && (
          <Button
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? "outline" : "default"}
            size="sm"
          >
            {showForm ? "Cancel" : "Write a Review"}
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="bg-muted/30 border border-border rounded-xl p-6 mb-8">
          <h3 className="font-medium mb-4">Share your experience with {productName}</h3>
          
          {/* Star Rating Input */}
          <div className="mb-4">
            <label className="text-sm text-muted-foreground block mb-2">Your Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      star <= (hoverRating || newRating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted-foreground/40"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review Text */}
          <div className="mb-4">
            <label className="text-sm text-muted-foreground block mb-2">
              Your Review (optional)
            </label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell others what you think about this product..."
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex items-center justify-between">
            {userHasPurchased && (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Verified Purchase</span>
              </div>
            )}
            <Button
              onClick={handleSubmitReview}
              disabled={submitting || newRating === 0}
              className="ml-auto"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-xl">
          <p className="text-muted-foreground mb-2">No reviews yet</p>
          <p className="text-sm text-muted-foreground">Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-border pb-6 last:border-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{review.reviewer_name}</span>
                    {review.is_verified_purchase && (
                      <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "fill-muted text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                </div>
              </div>
              {review.review_text && (
                <p className="text-foreground/80 leading-relaxed">{review.review_text}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Sign in prompt */}
      {!user && (
        <div className="text-center py-8 bg-muted/20 rounded-xl mt-6">
          <p className="text-muted-foreground mb-2">Want to leave a review?</p>
          <Button variant="outline" onClick={() => window.location.href = "/auth"}>
            Sign in to review
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;