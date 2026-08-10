import { useFavorites, useToggleFavorite } from './useFavorites';

export function useWishlist() {
  return useFavorites();
}

export function useToggleWishlist() {
  const toggleMutation = useToggleFavorite();

  return {
    ...toggleMutation,
    mutate: (productOrId: any) => {
      if (typeof productOrId === 'string') {
        toggleMutation.mutate({
          product: { id: productOrId } as any,
          isFavorited: false,
        });
      } else {
        toggleMutation.mutate({
          product: productOrId,
          isFavorited: false,
        });
      }
    },
  };
}

export { useFavorites, useToggleFavorite };
