import { Devvit } from '@devvit/public-api';

export const Preview = (): JSX.Element => (
  <zstack width="100%" height="100%" alignment="center middle">
    <image
      imageHeight={1024}
      imageWidth={1500}
      height="100%"
      width="100%"
      url="background-light.gif"
      description="Striped blue background"
      resizeMode="cover"
    />
    <image
      url="spinner.gif"
      description="Loading ..."
      imageHeight={1080}
      imageWidth={1080}
      width="128px"
      height="128px"
      resizeMode="scale-down"
    />
  </zstack>
);
