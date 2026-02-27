import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(() => {
    controller = new HealthController();
  });

  it('should return hello message', () => {
    expect(controller.hello()).toEqual({ message: "L'API Sen-Car Market est opérationnelle" });
  });

  it('should return EN_SERVICE health status', () => {
    expect(controller.health()).toEqual({ status: 'EN_SERVICE' });
  });
});
